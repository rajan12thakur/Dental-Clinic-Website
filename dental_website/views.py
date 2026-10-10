
from django.shortcuts import render


def home(request):
    """Render the public-facing clinic homepage."""
    return render(request, "dental_website/home.html")
