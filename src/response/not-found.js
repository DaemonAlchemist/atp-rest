/**
 * Created by Andrea on 10/17/2017.
 */

import {message} from "../util";

export default (req, res) => {
    res.status(404).send({messages: [
        message.error("The resource at " + req.method + " " + req.path + " does not exist")
    ]});
}