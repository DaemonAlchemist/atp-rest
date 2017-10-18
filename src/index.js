/**
 * Created by Andrea on 9/9/2017.
 */

import Success from "./response/success";
import NotFound from "./response/not-found";
import InternalServerError from "./response/internal-server-error";
import Error from "./response/error";

import rest from "./controller/rest";
import collection from "./controller/collection";
import subCollection from "./controller/sub-collection";
import create from "./controller/create";
import view from "./controller/view";
import update from "./controller/update";
import replace from "./controller/replace";
import deleteController from "./controller/delete";
import unlink from "./controller/unlink";

import {NOT_IMPLEMENTED, createRoutes, message} from "./util";

const respondWith = {Success, NotFound, InternalServerError, Error};

const basicController = {
    rest,
    entity: {collection, subCollection, create, view, update, replace, delete: deleteController, unlink}
};

export {NOT_IMPLEMENTED, createRoutes, message, respondWith, basicController};