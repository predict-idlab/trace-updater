import React, { Component } from 'react';
import PropTypes from 'prop-types';


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
            const rtrn = _prev_layout != updateData[0];
            // console.log("==============shouldComponentUpdate==============");
            // console.log("rtrn: ", rtrn);
            return rtrn;
        }
        return false;
    }

    render() {
        var { id, gdID, sequentialUpdate, updateData } = this.props;
        const traceColNames = ["hovertext", "text", "x", "y"];
        var graphDiv = document.getElementById(gdID);
        console.log("updateData: ", updateData);

        if (graphDiv && Array.isArray(updateData) && updateData.length > 1) {
            var trace, index, s_keys;
            graphDiv = graphDiv.getElementsByClassName('js-plotly-plot')[0];
            // console.log("graphDiv: ", graphDiv);

            if (sequentialUpdate) {
                for (let i = 1; i < updateData.length; i++) {
                    trace = updateData[i];
                    // get the trace it's index and delete it from the trace object
                    index = trace.index
                    delete trace.index;
                    if (trace != null && index != null) {
                        // put everything in the right format
                        for (const colName of traceColNames) {
                            if (trace[colName] == null) {
                                delete trace[colName];
                            }
                            else if (Array.isArray(trace[colName])) {
                                trace[colName] = [trace[colName]];
                            }
                        }
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

                // new variable to store the updated data in a compatible format to 
                // call restyle only once
                const singleUpdateData = { visible: [] };
                for (const k of s_keys) {
                    singleUpdateData[k] = [];
                }
                const index_arr = [];
                for (let i = 1; i < updateData.length; i++) {
                    trace = updateData[i];
                    if (Array.isArray(trace.x) &&race.x.length < 1) {
                        delete trace.x;
                        delete trace.y;
                    }

                    for (const k of s_keys) {
                        if (trace[k] === null) {
                            singleUpdateData[k].push([]);
                        } else {
                            singleUpdateData[k].push(trace[k]);
                        }
                    }
                    index_arr.push(trace.index);
                };
                Plotly.restyle(graphDiv, singleUpdateData, index_arr);
            }
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
