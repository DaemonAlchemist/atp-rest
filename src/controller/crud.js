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
    preDelete = identity,
    validateUpdate = identity,
    validateCreate = identity,
    validateDelete = identity
}) => {
    const viewParams = {
        model,
        permission: permissions.view,
        idField,
        validate: (v, req) => v.isInteger(req.params[idField], idField) //TODO:  Add existence validation
    };

    const updateParams = {
        model,
        permission: permissions.update,
        idField,
        validate: validateUpdate,
        preUpdate,
    };

    const deleteParams = {
        model,
        permission: permissions.delete,
        idField,
        validate: validateDelete,
        preDelete,
    };

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
            get: view(viewParams),
            put: replace(updateParams),
            patch: update(updateParams),
            delete: deleteController(deleteParams)
        }
    };
}