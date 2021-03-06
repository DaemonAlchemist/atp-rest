/**
 * Created by Andrea on 10/17/2017.
 */

import restController from "./rest";
import validator from 'atp-validator';

export default ({model, permission, idField = "id", validate = v => v, preUpdate = a => a}) => restController({
    getValidator: req => validate(
        validator()
            .loggedIn(req)
            .hasPermission(permission, req)
            .required(req.params[idField], idField),
        req
    ),
    loadResource: req => new Promise((resolve, reject) => {
        reject([{code: 500, msg: "PUT endpoints not implemented"}]);
    }),  //TODO:  Implement resource replacement (PUT)
});
