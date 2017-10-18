/**
 * Created by Andrea on 10/17/2017.
 */

import {message} from "../util";

export default (req, res, callback = e => e) => err => {
    res.status(500).send({messages: [
        message.error("Something went wrong: " + JSON.stringify(callback(err)))
    ]});
}