from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse
from django.contrib import messages
from django.core.validators import validate_email
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import random
import pickle
from django.contrib.messages import ERROR


# send email to user
def sendToUser(username, content):
    mail_host = "smtp.gmail.com"
    mail_user = "zgljzzb@gmail.com"
    mail_pass = "mbcofexxcdgfmcyx"
    mail_content = content

    # set message multiple part
    mess_root = MIMEMultipart('related')
    mess_root['Subject'] = 'The code of reset password'
    mess_root['From'] = mail_user
    mess_root['To'] = username

    # set the text form
    msgAlternative = MIMEMultipart('alternative')
    mess_root.attach(msgAlternative)

    # plain part of content
    message_plain = MIMEText('failed to load html version. please contact developer.', 'plain')
    msgAlternative.attach(message_plain)

    # html part of content
    message_html = MIMEText(mail_content, 'html')
    msgAlternative.attach(message_html)

    # send email to username
    smtp = smtplib.SMTP(mail_host, 587)
    smtp.starttls()
    smtp.login(mail_user, mail_pass)
    smtp.sendmail(mail_user, username, mess_root.as_string())


# login form
def login_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            request.session.setdefault('username', username)
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            messages.error(request, "username or password is incorrect")
            logout(request)
            return render(request, 'login.html')
    else:
        return render(request, 'login.html')


# user register form
def register_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        # check password are same
        if password1 == password2:
            password = password1
            email = request.POST['email']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                messages.error(request, "username already exists")
                return render(request, 'register.html')
            # make sure email is valid
            try:
                validate_email(email)
                user = User.objects.create_user(username, email, password)
                user.save()
                return HttpResponseRedirect(reverse("index"))
            except Exception as _:
                messages.error(request, "invalid email address or username already exists!")
                return render(request, 'register.html')
        else:
            messages.error(request, "two password not same!")
            return render(request, 'register.html')
    else:
        return render(request, 'register.html')


# first part of reset password which just need username to send verify code.
def resetpwd_send_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        user = User.objects.get(username=username)
        if user is not None:
            reset_code = random.randint(100000, 999999)
            # save random generated code for verify
            try:
                with open("resetCode.pkl", "ab") as f:
                    userPKL_read = pickle.load(f)
                    userPKL_read[username] = reset_code
                    pickle.dump(userPKL_read, f)
            except Exception as e:
                with open("resetCode.pkl", "wb") as f:
                    userPKL_write = {user.email: reset_code}
                    pickle.dump(userPKL_write, f)
            sendToUser(user.email, str(reset_code))
            return HttpResponseRedirect(reverse("usermanage:resetpwd"))
        else:
            return HttpResponseRedirect(reverse("usermanage:sendpwdemail"))
    else:
        return render(request, 'repwdem.html')


# part2 of reset password
def resetpwd_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        code = request.POST.get("code")
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        if password1 == password2:
            password = password1
            user = User.objects.get(username=username)
            # load saved verify code for make sure request is legal.
            with open("resetCode.pkl", "rb") as f:
                userPKL_read = pickle.load(f)
                reset_code = userPKL_read[user.email]
            if str(code) == str(reset_code):
                user.set_password(password)
                user.save()
                messages.add_message(request, ERROR, 'change password successful!')
            else:
                messages.error(request, "reset password code is incorrect")
            return HttpResponseRedirect(reverse("usermanage:login"))
        else:
            messages.error(request, "two password not same!")
            return render(request, 'resetpwd.html')
    else:
        return render(request, 'resetpwd.html')


# simple function for logout
def userlogout(request):
    logout(request)
    return render(request, 'login.html')
