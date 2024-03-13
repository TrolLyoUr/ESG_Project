from esg_app.models import Company

def get_companies_by_criteria(criteria):
    """
    search company
    """
    companies = Company.objects.all()
    
    if 'name' in criteria:
        companies = companies.filter(name__icontains=criteria['name'])

    return companies