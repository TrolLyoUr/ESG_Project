from .models import Company

def add_company(request):
    new_company = Company(name="Example Company", industry="Finance", market_cap=500000)
    new_company.save()
