/**
 * Created by Andrea on 10/17/2017.
 */

import restController from "./rest";
import validator from 'atp-validator';
import {o} from 'atp-sugar';

export default ({model, permission, validate = v => v, filter = req => ({}), processResults = results => ({results})}) => restController({
    getValidator: req => validate(
        validator()
            .loggedIn(req)
            .hasPermission(permission, req)
            .validCollectionFilters(req.query),
        req
    ),
    loadResource: req => new model().filter(o(req.query).merge(filter(req)).raw).list(),
    processResults: (resultsRaw, req) => new Promise((resolve, reject) => {
        const filters = o(req.query)
            .merge(filter(req))
            .delete('perPage')
            .delete('offset')
            .raw;
        const offset = req.query.offset || 0;
        const perPage = req.query.perPage || 9999999999999;
        Promise.resolve(processResults(resultsRaw, req)).then(results => {
            new model().filter(filters).count().then(count => {
                resolve(o({
                    meta: {
                        offset,
                        perPage,
                        page: offset/perPage + 1,
                        totalPages: Math.ceil(count/perPage),
                        totalRecords: count
                    }
                }).merge(results).raw);
            });
        });
    })
});
