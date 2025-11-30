# XSS-Demo

This project is a demonstration of different XSS vulnerabilities. A single docker image is provided to start the webserver.

Check out the live demo [here](https://xss.home.marvin-fuchs.de). 

**Be aware that this site is vulnerable to XSS. Do not input any private information and make sure CORS is enabled in your browser**

## Quick-Start

Start the docker container. The app is listening on port `8080`.

## Vulnerabilities

### 404 Page

The 404 page reflects the requested URL without proper sanitization.

- `http://localhost:8080/<img src=x onerror=alert('XSS')>`
