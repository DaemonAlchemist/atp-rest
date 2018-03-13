/**
 * Created by Andrea on 10/17/2017.
 */

import Promise from 'promise';
import InternalServerError from "./internal-server-error";

export default (req, res, callback = results => ({results}), raw = false, contentType = () => 'application/json') => results => {
    const type = contentType(results);
    Promise.resolve(callback(results, req)).then(results => {
        res.setHeader('Content-Type', type);
        res.status(200);
        !raw ? res.send(results) : res.end(results, 'binary');
    }).catch(InternalServerError(req, res));
};
