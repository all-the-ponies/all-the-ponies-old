from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer, test
from http import HTTPStatus
import html
import os
import io
import socket
from datetime import datetime
import re

import lxml.html

from urllib.parse import urlparse, parse_qsl, urlencode
import urllib.parse



looks_like_full_html = re.compile(
    br'^\s*<(?:html|!doctype)', re.I).match

def fix_html(source: bytes):
    now = datetime.now().timestamp()
    
    root: list[str | lxml.html.HtmlElement] = []

    is_full = False

    if looks_like_full_html(source):
        is_full = True
        root.append(lxml.html.fromstring(source))
    else:
        is_full = False
        root.extend(lxml.html.fragments_fromstring(source))
    
    for element in root:
        if not isinstance(element, lxml.html.HtmlElement):
            continue
        links = element.cssselect('link[href],script[src]')
        for link_element in links:
            attr = 'href'
            if link_element.tag == 'link':
                attr = 'href'
            elif link_element.tag == 'script':
                attr = 'src'
            
            url = urlparse(link_element.get(attr, ''))
            query = parse_qsl(url.query)
            query.append(('nocache', str(now)))
            url = url._replace(query = urlencode(query))
            link_element.set(attr, url.geturl())
    
    result = b''
    for element in root:
        if isinstance(element, str):
            result += element.encode()
            continue
        
        result += lxml.html.tostring(element)

    if is_full:
        result = b'<!DOCTYPE html>\n' + result
    
    return result


    


class HTTPServer(SimpleHTTPRequestHandler):
    def send_head(self):
        """Common code for GET and HEAD commands.

        This sends the response code and MIME headers.

        Return value is either a file object (which has to be copied
        to the outputfile by the caller unless the command was HEAD,
        and must be closed by the caller under all circumstances), or
        None, in which case the caller has nothing further to do.

        """
        path = self.translate_path(self.path)
        f = None
        if os.path.isdir(path):
            parts = urllib.parse.urlsplit(self.path)
            if not parts.path.endswith('/'):
                # redirect browser - doing basically what apache does
                self.send_response(HTTPStatus.MOVED_PERMANENTLY)
                new_parts = (parts[0], parts[1], parts[2] + '/',
                             parts[3], parts[4])
                new_url = urllib.parse.urlunsplit(new_parts)
                self.send_header("Location", new_url)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return None
            for index in self.index_pages:
                index = os.path.join(path, index)
                if os.path.isfile(index):
                    path = index
                    break
            else:
                return self.list_directory(path)
        ctype = self.guess_type(path)
        # check for trailing "/" which should return 404. See Issue17324
        # The test for this was added in test_httpserver.py
        # However, some OS platforms accept a trailingSlash as a filename
        # See discussion on python-dev and Issue34711 regarding
        # parsing and rejection of filenames with a trailing slash
        if path.endswith("/"):
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
            return None
        try:
            f = self.get_file(path)
            length = len(f.read())
            f.seek(0)
        except OSError:
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
            return None

        try:

            self.send_response(HTTPStatus.OK)
            self.send_header("Content-type", ctype)
            self.send_header("Content-Length", str(length))
            self.end_headers()
            return f
        except:
            f.close()
            raise

    def send_error(self, code: int, message: str | None = None, explain: str | None = None) -> None:
        # return super().send_error(code, message, explain)


        
        try:
            shortmsg, longmsg = self.responses[code]
        except KeyError:
            shortmsg, longmsg = '???', '???'
        if message is None:
            message = shortmsg
        if explain is None:
            explain = longmsg
        self.log_error("code %d, message %s", code, message)
        self.send_response(code, message)
        self.send_header('Connection', 'close')

        
        body = None
        if code == 404:
            path = self.translate_path('/404.html')
            ctype = self.guess_type(path)

            body = self.get_file(path).read()
            self.send_header("Content-Type", ctype)
            self.send_header('Content-Length', str(len(body)))


        # Message body is omitted for cases described in:
        #  - RFC7230: 3.3. 1xx, 204(No Content), 304(Not Modified)
        #  - RFC7231: 6.3.6. 205(Reset Content)
        elif (code >= 200 and
            code not in (HTTPStatus.NO_CONTENT,
                         HTTPStatus.RESET_CONTENT,
                         HTTPStatus.NOT_MODIFIED)):
            # HTML encode to prevent Cross Site Scripting attacks
            # (see bug #1100201)
            content = (self.error_message_format % {
                'code': code,
                'message': html.escape(message, quote=False),
                'explain': html.escape(explain, quote=False)
            })
            body = content.encode('UTF-8', 'replace')
            self.send_header("Content-Type", self.error_content_type)
            self.send_header('Content-Length', str(len(body)))
        self.end_headers()

        if self.command != 'HEAD' and body:
            self.wfile.write(body)
    
    def get_file(self, filename: str):
        ctype = self.guess_type(filename)

        result = b''

        if ctype == 'text/html':
            with open(filename, 'rb') as file:
                result = fix_html(file.read())
        else:
            with open(filename, 'rb') as file:
                result = file.read()
        
        return io.BytesIO(result)


if __name__ == '__main__':
    import argparse
    import contextlib

    parser = argparse.ArgumentParser()
    parser.add_argument('-b', '--bind', metavar='ADDRESS',
                        help='bind to this address '
                             '(default: all interfaces)')
    parser.add_argument('-d', '--directory', default=os.getcwd(),
                        help='serve this directory '
                             '(default: current directory)')
    parser.add_argument('-p', '--protocol', metavar='VERSION',
                        default='HTTP/1.0',
                        help='conform to this HTTP version '
                             '(default: %(default)s)')
    parser.add_argument('port', default=5500, type=int, nargs='?',
                        help='bind to this port '
                             '(default: %(default)s)')
    args = parser.parse_args()
    handler_class = HTTPServer

    # ensure dual-stack is not disabled; ref #38907
    class DualStackServer(ThreadingHTTPServer):

        def server_bind(self):
            # suppress exception when protocol is IPv4
            with contextlib.suppress(Exception):
                self.socket.setsockopt(
                    socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
            return super().server_bind()

        def finish_request(self, request, client_address):
            self.RequestHandlerClass(request, client_address, self,
                                     directory=args.directory)

    test(
        HandlerClass=handler_class,
        ServerClass=DualStackServer,
        port=args.port,
        bind=args.bind,
        protocol=args.protocol,
    )
