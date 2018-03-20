/**
 * Created by Andrea on 10/17/2017.
 */

import restController from "./rest";
import validator from 'atp-validator';
import {identity, remove} from 'atp-pointfree';

export default ({model, permission, validate = identity, filter = req => ({}), processFilters = identity, processResults = results => ({results})}) => restController({
    getValidator: req => validate(
        validator()
            .check("basic")
                .loggedIn(req)
                .hasPermission(permission, req)
                .validCollectionFilters(req.query),
        req
    ),
    loadResource: req => Promise
        .resolve(processFilters({
            ...req.query,
            ...filter(req)
        }))
        .then(filters => {
            req.__processedFilters__ = filters;
            return new model().filter(filters).list();
        }),
    processResults: (resultsRaw, req) => new Promise((resolve, reject) => {
        const filters = remove(['perPage', 'offset'])(req.__processedFilters__);
        const offset = req.query.offset || 0;
        const perPage = req.query.perPage || 9999999999999;
        Promise.resolve(processResults(resultsRaw, req)).then(results => {
            new model().filter(filters).count().then(count => {
                resolve({
                    meta: {
                        offset,
                        perPage,
                        page: offset/perPage + 1,
                        totalPages: Math.ceil(count/perPage),
                        totalRecords: count
                    },
                    ...results
                });
            });
        });
    })
});
