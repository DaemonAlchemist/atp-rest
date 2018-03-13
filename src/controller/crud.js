/**
 * Created by Andrea on 10/20/2017.
 */

import collection from "./collection";
import create from "./create";
import view from "./view";
import update from "./update";
import replace from "./replace";
import deleteController from "./delete";
import {identity} from 'atp-pointfree';

export default ({
    model, permissions, idField,
    processCollectionResults = results => ({results}),
    preInsert = identity,
    preUpdate = identity,
    validateUpdate = identity,
    validateCreate = identity,
}) => {
    const restParams = permission => ({
        model,
        permission,
        idField,
        validate: (v, req) => v.isInteger(req.params[idField], idField) //TODO:  Add existence validation
    });

    const updateParams = permission => ({
        model,
        permission,
        idField,
        validate: validateUpdate,
        preUpdate,
    });

    return {
        get: collection({
            model,
            permission: permissions.view,
            processResults: processCollectionResults
        }),
        post: create({
            model,
            permission: permissions.create,
            validate: validateCreate,
            preInsert
        }),
        [':' + idField]: {
            get: view(restParams(permissions.view)),
            put: replace(updateParams(permissions.update)),
            patch: update(updateParams(permissions.update)),
            delete: deleteController(restParams(permissions.delete))
        }
    };
}