/**
 * Created by Andrea on 10/17/2017.
 */

import restController from "./rest";
import validator from 'atp-validator';
import {o} from 'atp-sugar';

export default ({model, permission, validate = v => v, filter = req => ({}), processResults = r => r}) => restController({
    getValidator: req => validate(
        validator()
            .loggedIn(req)
            .hasPermission(permission, req)
            .validCollectionFilters(req.query),
        req
    ),
    loadResource: req => new model().filter(o(req.query).merge(filter(req)).raw).list(),
    processResults
});
