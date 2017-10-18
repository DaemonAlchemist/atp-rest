/**
 * Created by Andrea on 10/17/2017.
 */

import {a} from 'atp-sugar';
import InternalServerError from "./internal-server-error";
import {message} from "../util";

export default (req, res, callback = e => e) => errors => {
    errors = callback(errors);
    try {
        res.status(a(errors.map(err => err.code)).max()).send({
            messages: errors.map(err => message.error(err.msg))
        });
    } catch(e) {
        InternalServerError(req, res)(errors);
    }
};
