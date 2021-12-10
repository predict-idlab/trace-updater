import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { head, tail, isPlainObject, isArray, isNil, flatMap, keys, toPairs, fromPairs, mapValues, zipObject, isElement, uniq } from 'lodash';

/**
 * TraceUpdater is a component which updates the trace-data of a plotly graph.
 * It takes the properties
 *  - gdID - which is the DCC.graph its id
 *  - sequentialUpdate - if true, each trace is updated sequentially;
 *      i.e. Plotly.restyle is called sequentially
 *  - updatedData - A list whose:
 *     * first object withholds the to-be applied layout
 *     * second to ... object contain the updated trace data and its corresponding
 *       index under the `index` attribute
 */
export default class TraceUpdater extends Component {
    
    static #previous_layout = null;

    shouldComponentUpdate({ updateData }) {
        return TraceUpdater.#previous_layout != head(updateData);
    }
    
    render() {
        /// VALIDATION ///

        const { id, gdID, sequentialUpdate, updateData } = this.props;
        if (!isArray(updateData) || !head(updateData.length)) throw Error(`Invalid updateData '${updateData}'`);
        
        const graphDiv = document?.getElementById(gdID)?.getElementsByClassName('js-plotly-plot')?.[0];
        if (!isElement(graphDiv)) throw Error(`Invalid graphDiv 'graphDiv' for gdID '${gdID}'`);
        
        
        /// HELPER FUNCTIONS ///

        const plotlyRestyle = ({ index, ...update }) =>
            Plotly.restyle(graphDiv, update, index);

        const isValidTrace = (trace) =>
            isPlainObject(trace) && !isNil(trace.index);
        
        const filterTrace = (trace) => fromPairs(
            toPairs(trace)
            .filter(([_, value]) => !isNil(value))
            .filter(([key, _]) => !['x','y'].includes(key) || trace.x !== [])
        );

        const filterTraces = (traces) =>
            traces
            .filter(isValidTrace)
            .map(filterTrace);

        const formatValue = (value) =>
            isArray(value) ? [value] : value;

        const formatTrace = (trace) =>
            mapValues(trace, formatValue);

        const formatTraces = (traces) =>
            traces.map(formatTrace);

        const mergeKeys = (traces) =>
            uniq(flatMap(traces, keys));
        
        const mergeValues = (traces, allkeys) =>
            allkeys.map(
                key => traces.map(
                    trace => trace[key] ?? []
                )
            );
        
        const mergeTraces = (traces) => {
            const allkeys = mergeKeys(traces);
            const allvalues = mergeValues(traces, allkeys);
            return zipObject(allkeys, allvalues);
        };


        /// EXECUTION ///

        TraceUpdater.#previous_layout = head(updateData);
        const traces = filterTraces(tail(updateData));

        if (sequentialUpdate) {
            formatTraces(traces).forEach(plotlyRestyle);
        } else {
            plotlyRestyle(mergeTraces(traces));
        }

        return <div id={id}></div>;
    }
}

TraceUpdater.defaultProps = {
    sequentialUpdate: true,
};

TraceUpdater.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * The id of the graph-div whose traces should be
     */
    gdID: PropTypes.string.isRequired,

    /**
     * Bool indicating whether the figure should be redrawn sequentially (i.e.)
     * calling the restyle multiple times or at once.
     * (still needs to be determined which is faster has the lowest memory peak)
     */
    sequentialUpdate: PropTypes.bool,

    /**
     * The data to update the graph with, must contain the `index` property for
     * each trace; either a list of dict-traces or a single trace
     */
    updateData: PropTypes.array,

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func
};
