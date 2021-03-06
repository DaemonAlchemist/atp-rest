/**
 * Created by Andrea on 9/9/2017.
 */

import Success from "./response/success";
import NotFound from "./response/not-found";
import InternalServerError from "./response/internal-server-error";
import Error from "./response/error";

import rest from "./controller/rest";
import crud from "./controller/crud";
import collection from "./controller/collection";
import subCollection from "./controller/sub-collection";
import children from "./controller/children";
import create from "./controller/create";
import view from "./controller/view";
import update from "./controller/update";
import replace from "./controller/replace";
import deleteController from "./controller/delete";
import unlink from "./controller/unlink";
import many2many from './controller/many-2-many';

import {NOT_IMPLEMENTED, NOT_SUPPORTED, createRoutes, message} from "./util";

const respondWith = {Success, NotFound, InternalServerError, Error};

const basicController = {
    rest,
    entity: {
        crud,
        collection, subCollection, children,
        create, view, update, replace, delete: deleteController,
        unlink, many2many
    }
};

export {NOT_IMPLEMENTED, NOT_SUPPORTED, createRoutes, message, respondWith, basicController};