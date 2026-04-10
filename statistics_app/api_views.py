"""
JSON API views for statistics — public workshop stats and team stats.
"""
import datetime as dt

from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_GET

from workshop_app.models import Workshop, WorkshopType, states
from teams.models import Team


def is_instructor(user):
    return user.groups.filter(name='instructor').exists()


@require_GET
def api_public_stats(request):
    """Public workshop stats with optional filters."""
    from_date = request.GET.get('from_date')
    to_date = request.GET.get('to_date')
    state = request.GET.get('state')
    workshoptype = request.GET.get('workshop_type')
    sort = request.GET.get('sort', 'date')
    page_num = request.GET.get('page', 1)
    show_workshops = request.GET.get('show_workshops')

    if from_date and to_date:
        workshops = Workshop.objects.filter(
            date__range=(from_date, to_date), status=1
        ).order_by(sort)
        if state:
            workshops = workshops.filter(coordinator__profile__state=state)
        if workshoptype:
            workshops = workshops.filter(workshop_type_id=workshoptype)
    else:
        today = timezone.now()
        upto = today + dt.timedelta(days=15)
        workshops = Workshop.objects.filter(
            date__range=(today, upto), status=1
        ).order_by('date')

    user = request.user
    if show_workshops and user.is_authenticated:
        if is_instructor(user):
            workshops = workshops.filter(instructor_id=user.id)
        else:
            workshops = workshops.filter(coordinator_id=user.id)

    ws_states, ws_count = Workshop.objects.get_workshops_by_state(workshops)
    ws_type, ws_type_count = Workshop.objects.get_workshops_by_type(workshops)

    paginator = Paginator(workshops, 30)
    page = paginator.get_page(page_num)

    workshop_list = []
    for w in page:
        try:
            inst = w.coordinator.profile.institute
        except Exception:
            inst = ''
        workshop_list.append({
            'id': w.id,
            'coordinator_name': w.coordinator.get_full_name(),
            'institute': inst,
            'instructor_name': w.instructor.get_full_name() if w.instructor else '',
            'workshop_type': w.workshop_type.name,
            'date': str(w.date),
        })

    # Workshop types for filter dropdown
    all_types = [{'id': wt.id, 'name': wt.name} for wt in WorkshopType.objects.all()]
    all_states = [{'code': code, 'name': name} for code, name in states if code]

    return JsonResponse({
        'workshops': workshop_list,
        'has_next': page.has_next(),
        'has_previous': page.has_previous(),
        'num_pages': paginator.num_pages,
        'current_page': page.number,
        'chart': {
            'states': ws_states,
            'state_counts': ws_count,
            'types': ws_type,
            'type_counts': ws_type_count,
        },
        'filter_options': {
            'workshop_types': all_types,
            'states': all_states,
        }
    })


@login_required
@require_GET
def api_team_stats(request, team_id=None):
    """Team workshop count stats — instructor only."""
    user = request.user
    teams = Team.objects.all()
    if team_id:
        try:
            team = teams.get(id=team_id)
        except Team.DoesNotExist:
            return JsonResponse({'error': 'Team not found'}, status=404)
    else:
        team = teams.first()
        if team is None:
            return JsonResponse({'error': 'No teams found'}, status=404)

    if not team.members.filter(user_id=user.id).exists():
        return JsonResponse({'error': 'You are not part of this team'}, status=403)

    member_data = []
    for member in team.members.all():
        count = Workshop.objects.filter(instructor_id=member.user.id).count()
        member_data.append({'name': member.user.get_full_name(), 'count': count})

    all_teams = [{'id': t.id, 'name': t.name} for t in teams]
    return JsonResponse({
        'team_id': team.id,
        'team_name': team.name,
        'members': member_data,
        'all_teams': all_teams,
    })
