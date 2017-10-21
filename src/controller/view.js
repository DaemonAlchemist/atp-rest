/**
 * Created by Andrea on 10/17/2017.
 */

import restController from './rest';
import validator from 'atp-validator';

export default ({
    model,
    permission,
    idField = "id",
    validate = v => v,
    processResults = a => a,
    raw = false,
    contentType = () => 'application/json'
}) => restController({
    getValidator: req => validate(
        validator()
            .loggedIn(req)
            .hasPermission(permission, req)
            .required(req.params[idField], idField),
        req
    ),
    loadResource: req => new model().getById(req.params[idField]),
    processResults,
    raw,
    contentType
});
