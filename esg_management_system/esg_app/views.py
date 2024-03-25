from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView


@method_decorator(login_required(login_url='/usermanage/login'), name='dispatch')
class IndexView(TemplateView):
    template_name = "build/index.html"


@login_required(login_url='/usermanage/login')
@api_view(['GET'])
def test(request):
    return Response({'message': 'Fuck you, world!'})
