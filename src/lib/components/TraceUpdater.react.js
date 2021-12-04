import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

// function used to extract the '.'-string objects into expanded objects :)
const transformObj = obj => {
    return Object.keys(obj).reduce((acc, key) => {
        if (key.indexOf('.') >= 0) {
            const [parentKey, childKey] = key.split('.');
            acc[parentKey] = acc[parentKey] || {};
            acc[parentKey][childKey] = obj[key];
        } else {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
}

var _prev_layout = null;

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
    constructor(props) {
        super(props);
    }


    shouldComponentUpdate(nextProps) {
        var { updateData } = nextProps
        if (Array.isArray(updateData) && updateData.length > 1) {
            // console.log("==============shouldComponentUpdate==============");
            var rtrn = _prev_layout != updateData[0];
            // console.log("rtrn: ", rtrn);
            return rtrn;
        }
        return false;
    }

    render() {
        var { id, gdID, sequentialUpdate, updateData } = this.props;
        const traceColNames = ["hovertext", "text", "x", "y"];
        var graphDiv = document.getElementById(gdID)

        if (graphDiv && Array.isArray(updateData) && updateData.length > 1) {
            _prev_layout = updateData[0]
            var trace, index, s_keys;
            graphDiv = graphDiv.getElementsByClassName('js-plotly-plot')[0];
            // console.log("graphDiv: ", graphDiv);

            // appearantly I need to do this to copy this object properly
            var prev_layout = JSON.parse(JSON.stringify(graphDiv.layout));

            if (sequentialUpdate) {
                for (let i = 1; i < updateData.length; i++) {
                    trace = updateData[i];
                    // get the trace it's index and delete it from the trace object
                    index = trace.index
                    delete trace.index;
                    if (trace != null && index != null) {
                        // put everythin in the right format
                        for (const colName of traceColNames) {
                            if (trace[colName] == null) {
                                delete trace[colName];
                            }
                            else if (Array.isArray(trace[colName])) {
                                trace[colName] = [trace[colName]];
                            }
                        }
                        trace.visible = graphDiv._fullData[index].visible;
                        Plotly.restyle(graphDiv, trace, index);
                    };
                };
            }
            else {
                // Create a set-union of all the to-be-updated traces their 
                // first-level keys
                s_keys = new Set();
                for (let i = 1; i < updateData.length; i++) {
                    Object.keys(updateData[i]).forEach(key => s_keys.add(key));
                }
                // Delete the visible key (as the back-end doesn't know what part of the
                // front-end data actually is visible)
                s_keys.delete("visible");

                // new variable to store the updated layout in a compatible format to 
                // call restyle only once
                const singleUpdateData = { visible: [] };
                for (const k of s_keys) {
                    singleUpdateData[k] = [];
                }
                const index_arr = [];
                for (let i = 1; i < updateData.length; i++) {
                    trace = updateData[i];
                    for (const k of s_keys) {
                        if (trace[k] === null) {
                            singleUpdateData[k].push([]);
                        } else {
                            singleUpdateData[k].push(trace[k]);
                        }
                    }
                    // push the front-end data visible key
                    singleUpdateData.visible.push(graphDiv._fullData[trace.index].visible);
                    index_arr.push(trace.index);
                };
                Plotly.restyle(graphDiv, singleUpdateData, index_arr);
            }

            // TODO -> this relout re-calls this script - should be fixed
            // update the layout - use a merge of the old-layout and a 
            //      object "."extension of the new-layout e.g.
            //      -> xaxis.autorange = true --> { xaxis : { autorange : true } }
            Plotly.relayout(graphDiv, _.merge(prev_layout, transformObj(updateData[0])));
        };
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
