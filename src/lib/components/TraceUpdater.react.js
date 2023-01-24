import {Component} from 'react';
import PropTypes from 'prop-types';
import {
    head,
    tail,
    isPlainObject,
    isArray,
    isNil,
    flatMap,
    keys,
    toPairs,
    fromPairs,
    mapValues,
    zipObject,
    uniq
} from 'lodash';
import { getGraphDiv } from '../utils/updaterUtils';


// HELPER FUNCTIONS //
const plotlyRestyle = (graphDiv, {index, ...update}) =>
    Plotly.restyle(graphDiv, update, index);

const isValidTrace = (trace) =>
    isPlainObject(trace) && !isNil(trace.index);

const filterTrace = (trace) => fromPairs(
    toPairs(trace)
        .filter(([_, value]) => !isNil(value))
        .filter(([key, _]) => !['x', 'y'].includes(key) || trace.x !== [])
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


/**
 * TraceUpdater is a component which updates the trace-data of a plotly graph.
 */
export default class TraceUpdater extends Component {

    static #previousLayout = null;

    shouldComponentUpdate({ updateData }) {
        return isArray(updateData) && updateData.length > 1 && TraceUpdater.#previousLayout !== head(updateData);
    }

    render() {
        // VALIDATION //
        const {id, gdID, sequentialUpdate, updateData} = this.props;
        const idDiv = <div id={id}></div>;
        if (!this.shouldComponentUpdate(this.props)) { return idDiv; }

        // EXECUTION //
        TraceUpdater.#previousLayout = head(updateData);
        let graphDiv = getGraphDiv(gdID);
        const traces = filterTraces(tail(updateData));
        if (sequentialUpdate) {
            formatTraces(traces).forEach(trace => plotlyRestyle(graphDiv, trace));
        } else { plotlyRestyle(graphDiv, mergeTraces(traces)); }

        // RETURN //
        return idDiv;
    }
}

TraceUpdater.defaultProps = {
    sequentialUpdate: false,
};

TraceUpdater.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * The id of the graph-div whose traces should be updated.
     *
     * .. Note:
     *
     *   * if you use multiple graphs; each graph MUST have a unique id; otherwise we
     *     cannot guarantee that resampling will work correctly.
     *   * TraceUpdater will determine the html-graph-div by performing partial matching
     *     on the "id" property (using `gdID`) of all divs with classname="dash-graph".
     *     It will select the first item of that match list; so if multiple same
     *     graph-div IDs are used, or one graph-div-ID is a subset of the other (partial
     *     matching) there is no guarantee that the correct div will be selected.
     */
    gdID: PropTypes.string.isRequired,

    /**
     * Bool indicating whether the figure should be redrawn sequentially (i.e.)
     * calling the restyle multiple times or at once.
     * (still needs to be determined which is faster has the lowest memory peak),
     * by default False.
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
