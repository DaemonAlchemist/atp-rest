/**
 * Created by Andrea on 10/17/2017.
 */

import restController from './rest';
import validator from 'atp-validator';
import {databaseError} from "../util";
import {identity} from 'atp-pointfree';

export default ({model, permission, idField = "id", validate = identity, preDelete = identity}) => restController({
    getValidator: req => validate(
        validator()
            .loggedIn(req)
            .hasPermission(permission, req)
            .required(req.params[idField], idField),
        req
    ),
    loadResource: req => new Promise((resolve, reject) => {
        Promise.resolve(preDelete(req)).then(() => {
            new model()
                .where({id: req.params[idField]})
                .limit(1)
                .delete()
                .then(resolve)
                .catch(databaseError(reject));
        });
    }),
});
