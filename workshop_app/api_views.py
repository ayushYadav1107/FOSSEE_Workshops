"""
JSON API views for the React frontend.
All endpoints use Django session authentication + CSRF.
"""
import json
from datetime import datetime

from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.http import require_http_methods, require_POST, require_GET
from django.db.models import Q

from .forms import UserRegistrationForm, WorkshopForm, CommentsForm, WorkshopTypeForm
from .models import Profile, User, Workshop, Comment, WorkshopType, AttachmentFile, states
from .send_mails import send_email


# ─── Helpers ────────────────────────────────────────────────────────────────────

def is_instructor(user):
    return user.groups.filter(name='instructor').exists()


def json_error(msg, status=400):
    return JsonResponse({'error': msg}, status=status)


def json_ok(data=None, **kwargs):
    payload = {'ok': True}
    if data is not None:
        payload.update(data)
    payload.update(kwargs)
    return JsonResponse(payload)


# ─── Auth ────────────────────────────────────────────────────────────────────────

@require_GET
def api_csrf(request):
    """Return a CSRF token so the React app can bootstrap."""
    return JsonResponse({'csrfToken': get_token(request)})


@require_GET
def api_current_user(request):
    """Return current authenticated user info."""
    if not request.user.is_authenticated:
        return JsonResponse({'authenticated': False})
    user = request.user
    try:
        profile = user.profile
        profile_data = {
            'title': profile.title,
            'institute': profile.institute,
            'department': profile.department,
            'phone_number': profile.phone_number,
            'position': profile.position,
            'location': profile.location,
            'state': profile.state,
            'is_email_verified': profile.is_email_verified,
        }
    except Exception:
        profile_data = {}
    return JsonResponse({
        'authenticated': True,
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'is_instructor': is_instructor(user),
        'profile': profile_data,
    })


@require_POST
def api_login(request):
    """Login with username + password."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return json_error('Invalid JSON')
    username = data.get('username', '').strip()
    password = data.get('password', '')
    if not username or not password:
        return json_error('Username and password are required')
    user = authenticate(request, username=username, password=password)
    if user is None:
        return json_error('Invalid username or password', status=401)
    login(request, user)
    return json_ok({
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_instructor': is_instructor(user),
    })


@require_POST
def api_logout(request):
    logout(request)
    return json_ok()


@require_POST
def api_register(request):
    """Register a new coordinator (no email verification required)."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return json_error('Invalid JSON')
    form = UserRegistrationForm(data)
    if form.is_valid():
        username, password, _key = form.save()
        # Auto-verify the account so the user can log in immediately
        new_user = authenticate(username=username, password=password)
        new_user.profile.is_email_verified = True
        new_user.profile.save()
        login(request, new_user)
        return JsonResponse({'ok': True, 'redirect': '/login'}, status=201)
    return JsonResponse({'ok': False, 'errors': form.errors}, status=400)


@require_GET
def api_activate(request, key=None):
    """Activate user email via activation key."""
    if key is None:
        return json_error('No key provided', 400)
    user_qs = Profile.objects.filter(activation_key=key)
    if not user_qs.exists():
        return json_error('Invalid activation key', 404)
    profile = user_qs.first()
    profile.is_email_verified = True
    profile.save()
    return json_ok({'message': 'Email verified successfully'})


# ─── Workshops ───────────────────────────────────────────────────────────────────

@login_required
@require_GET
def api_workshop_status(request):
    """Return workshops relevant to the current user."""
    user = request.user
    today = timezone.now().date()
    if is_instructor(user):
        workshops = Workshop.objects.filter(
            Q(instructor=user.id, date__gte=today) | Q(status=0)
        ).order_by('-date')
        data = []
        for w in workshops:
            try:
                inst = w.coordinator.profile.institute
            except Exception:
                inst = ''
            data.append({
                'id': w.id,
                'coordinator_name': w.coordinator.get_full_name(),
                'coordinator_id': w.coordinator.id,
                'institute': inst,
                'workshop_type': str(w.workshop_type),
                'date': str(w.date),
                'status': w.status,
                'status_label': w.get_status(),
                'tnc_accepted': w.tnc_accepted,
            })
        return JsonResponse({'role': 'instructor', 'workshops': data, 'today': str(today)})
    else:
        workshops = Workshop.objects.filter(coordinator=user.id).order_by('-date')
        data = []
        for w in workshops:
            inst_name = w.instructor.get_full_name() if w.instructor else None
            data.append({
                'id': w.id,
                'workshop_type': str(w.workshop_type),
                'instructor_name': inst_name,
                'date': str(w.date),
                'status': w.status,
                'status_label': w.get_status(),
                'tnc_accepted': w.tnc_accepted,
            })
        return JsonResponse({'role': 'coordinator', 'workshops': data})


@login_required
@require_POST
def api_accept_workshop(request, workshop_id):
    if not is_instructor(request.user):
        return json_error('Forbidden', 403)
    try:
        workshop = Workshop.objects.get(id=workshop_id)
    except Workshop.DoesNotExist:
        return json_error('Not found', 404)
    workshop.status = 1
    workshop.instructor = request.user
    workshop.save()
    coordinator_profile = workshop.coordinator.profile
    send_email(request, call_on='Booking Confirmed', user_position='instructor',
               workshop_date=str(workshop.date), workshop_title=workshop.workshop_type.name,
               user_name=workshop.coordinator.get_full_name(),
               other_email=workshop.coordinator.email,
               phone_number=coordinator_profile.phone_number,
               institute=coordinator_profile.institute)
    send_email(request, call_on='Booking Confirmed',
               workshop_date=str(workshop.date), workshop_title=workshop.workshop_type.name,
               other_email=workshop.coordinator.email,
               phone_number=request.user.profile.phone_number)
    return json_ok({'message': 'Workshop accepted'})


@login_required
@require_POST
def api_change_workshop_date(request, workshop_id):
    if not is_instructor(request.user):
        return json_error('Forbidden', 403)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return json_error('Invalid JSON')
    new_date_str = data.get('new_date', '')
    try:
        new_workshop_date = datetime.strptime(new_date_str, '%Y-%m-%d')
    except ValueError:
        return json_error('Invalid date format. Use YYYY-MM-DD')
    if datetime.today() > new_workshop_date:
        return json_error('Date must be in the future')
    workshop = Workshop.objects.filter(id=workshop_id)
    if not workshop.exists():
        return json_error('Not found', 404)
    old_date = workshop.first().date
    workshop.update(date=new_workshop_date)
    send_email(request, call_on='Change Date', user_position='instructor',
               workshop_date=str(old_date), new_workshop_date=str(new_workshop_date.date()))
    send_email(request, call_on='Change Date',
               new_workshop_date=str(new_workshop_date.date()), workshop_date=str(old_date),
               other_email=workshop.first().coordinator.email)
    return json_ok({'message': 'Date updated'})


@login_required
@require_POST
def api_propose_workshop(request):
    user = request.user
    if is_instructor(user):
        return json_error('Instructors cannot propose workshops', 403)
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return json_error('Invalid JSON')
    form = WorkshopForm(data)
    if form.is_valid():
        form_data = form.save(commit=False)
        form_data.coordinator = user
        if Workshop.objects.filter(
            date=form_data.date,
            workshop_type=form_data.workshop_type,
            coordinator=form_data.coordinator
        ).exists():
            return json_error('A workshop with these details already exists')
        form_data.save()
        instructors = Profile.objects.filter(position='instructor')
        for i in instructors:
            send_email(request, call_on='Proposed Workshop', user_position='instructor',
                       workshop_date=str(form_data.date), workshop_title=form_data.workshop_type,
                       user_name=user.get_full_name(), other_email=i.user.email,
                       phone_number=user.profile.phone_number, institute=user.profile.institute)
        return JsonResponse({'ok': True, 'message': 'Workshop proposed'}, status=201)
    return JsonResponse({'ok': False, 'errors': form.errors}, status=400)


@require_GET
def api_workshop_types(request):
    """List all workshop types (paginated)."""
    page_num = request.GET.get('page', 1)
    types = WorkshopType.objects.all().order_by('id')
    paginator = Paginator(types, 12)
    page = paginator.get_page(page_num)
    data = [{'id': wt.id, 'name': wt.name, 'description': wt.description, 'duration': wt.duration}
            for wt in page]
    return JsonResponse({
        'types': data,
        'has_next': page.has_next(),
        'has_previous': page.has_previous(),
        'num_pages': paginator.num_pages,
        'current_page': page.number,
    })


@require_GET
def api_workshop_type_detail(request, workshop_type_id):
    try:
        wt = WorkshopType.objects.get(id=workshop_type_id)
    except WorkshopType.DoesNotExist:
        return json_error('Not found', 404)
    attachments = []
    for af in AttachmentFile.objects.filter(workshop_type=wt):
        attachments.append({'id': af.id, 'url': af.attachments.url if af.attachments else None})
    return JsonResponse({
        'id': wt.id, 'name': wt.name, 'description': wt.description,
        'duration': wt.duration, 'terms_and_conditions': wt.terms_and_conditions,
        'attachments': attachments,
    })


@require_GET
def api_workshop_type_tnc(request, workshop_type_id):
    try:
        wt = WorkshopType.objects.get(id=workshop_type_id)
    except WorkshopType.DoesNotExist:
        return json_error('Not found', 404)
    return JsonResponse({'tnc': wt.terms_and_conditions})


@login_required
def api_workshop_detail(request, workshop_id):
    try:
        workshop = Workshop.objects.get(id=workshop_id)
    except Workshop.DoesNotExist:
        return json_error('Not found', 404)
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return json_error('Invalid JSON')
        form = CommentsForm(data)
        if form.is_valid():
            comment = form.save(commit=False)
            if not is_instructor(request.user):
                comment.public = True
            comment.author = request.user
            comment.created_date = timezone.now()
            comment.workshop = workshop
            comment.save()
            return JsonResponse({'ok': True, 'message': 'Comment posted'}, status=201)
        return JsonResponse({'ok': False, 'errors': form.errors}, status=400)
    # GET
    if is_instructor(request.user):
        comments_qs = Comment.objects.filter(workshop=workshop).order_by('created_date')
    else:
        comments_qs = Comment.objects.filter(workshop=workshop, public=True).order_by('created_date')
    comments = [{
        'id': c.id,
        'author': c.author.get_full_name(),
        'comment': c.comment,
        'public': c.public,
        'created_date': c.created_date.isoformat(),
    } for c in comments_qs]
    try:
        inst = workshop.coordinator.profile.institute
    except Exception:
        inst = ''
    return JsonResponse({
        'id': workshop.id,
        'coordinator_name': workshop.coordinator.get_full_name(),
        'coordinator_id': workshop.coordinator.id,
        'institute': inst,
        'workshop_type': str(workshop.workshop_type),
        'date': str(workshop.date),
        'status': workshop.status,
        'status_label': workshop.get_status(),
        'comments': comments,
    })


# ─── Profile ─────────────────────────────────────────────────────────────────────

@login_required
@require_GET
def api_own_profile(request):
    user = request.user
    try:
        p = user.profile
        profile_data = {
            'title': p.title, 'institute': p.institute, 'department': p.department,
            'phone_number': p.phone_number, 'position': p.position, 'location': p.location,
            'state': p.state, 'how_did_you_hear_about_us': p.how_did_you_hear_about_us,
        }
    except Exception:
        profile_data = {}
    return JsonResponse({
        'id': user.id, 'username': user.username, 'email': user.email,
        'first_name': user.first_name, 'last_name': user.last_name,
        'profile': profile_data,
    })


@login_required
@require_POST
def api_update_profile(request):
    user = request.user
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return json_error('Invalid JSON')
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.save()
    p = user.profile
    p.title = data.get('title', p.title)
    p.institute = data.get('institute', p.institute)
    p.department = data.get('department', p.department)
    p.phone_number = data.get('phone_number', p.phone_number)
    p.location = data.get('location', p.location)
    p.state = data.get('state', p.state)
    p.save()
    return json_ok({'message': 'Profile updated'})


@login_required
@require_GET
def api_coordinator_profile(request, user_id):
    if not is_instructor(request.user):
        return json_error('Forbidden', 403)
    try:
        profile = Profile.objects.get(user_id=user_id)
    except Profile.DoesNotExist:
        return json_error('Not found', 404)
    workshops = Workshop.objects.filter(coordinator=user_id).order_by('date')
    ws_data = [{
        'id': w.id, 'workshop_type': str(w.workshop_type),
        'date': str(w.date), 'status': w.status, 'status_label': w.get_status(),
        'instructor': w.instructor.get_full_name() if w.instructor else None,
    } for w in workshops]
    return JsonResponse({
        'id': profile.user.id,
        'first_name': profile.user.first_name,
        'last_name': profile.user.last_name,
        'email': profile.user.email,
        'institute': profile.institute,
        'department': profile.department,
        'phone_number': profile.phone_number,
        'location': profile.location,
        'state': profile.state,
        'position': profile.position,
        'workshops': ws_data,
    })


# ─── Form metadata ───────────────────────────────────────────────────────────────

@require_GET
def api_form_choices(request):
    """Return dropdown choices for registration/profile forms."""
    from .models import department_choices, title, source, states, position_choices
    return JsonResponse({
        'departments': list(department_choices),
        'titles': list(title),
        'sources': list(source),
        'states': list(states),
        'positions': list(position_choices),
    })
