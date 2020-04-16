import * as https from "https";
import {URL} from 'url';
import * as querystring from "querystring";
import * as http from "http";
import {IncomingMessage} from "http";

interface RequestParams {
    qs?: {
        [key: string]: string | number | boolean | string[] | number[] | boolean[] | undefined | null;
    };
    auth?: {
        username: string;
        password: string;
    };
}

export default function request<T>(urlStr: string, params?: RequestParams): Promise<T> {
    const requestURL = new URL(urlStr);
    if (params) {
        if (params.qs) {
            const qs = querystring.parse(querystring.stringify(params.qs));
            Object.entries(qs).forEach(([ key, value ]) => {
                if (Array.isArray(value)) {
                    for (const v of value) {
                        requestURL.searchParams.append(key, v);
                    }
                } else {
                    requestURL.searchParams.append(key, value);
                }
            })
        }
        if (params.auth) {
            requestURL.username = params.auth.username;
            requestURL.password = params.auth.password;
        }
    }

    return new Promise<T>((resolve, reject) => {
        const callback = (res: IncomingMessage): void => {
            let body = '';

            res.on('data', function (chunk) {
                body += chunk;
            });

            res.on('end', function () {
                resolve(JSON.parse(body));
            });
        };

        if (requestURL.protocol === 'https:') {
            https.get(requestURL, callback).on('error', reject);
        } else if (requestURL.protocol === 'http:') {
            http.get(requestURL, callback).on('error', reject);
        }
    });
}
