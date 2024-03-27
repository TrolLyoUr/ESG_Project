from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required


# Create your views here.
@method_decorator(login_required(login_url='/usermanage/login'), name='dispatch')
class IndexView(TemplateView):
    template_name = "build/index.html"
