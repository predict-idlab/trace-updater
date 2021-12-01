import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * TraceUpdater is a component which updates the trace of a given figure.
 * It takes the properties 
 *  - gdID - which is the DCC.graph its id
 *  - updatedData - A list whose
 *     * first object withholds the to-be applied layout
 *     * second to ... object contain the updated trace data and its corresponding 
 *       index under the `index` attribute
 */
export default class TraceUpdater extends Component {
    render() {
        var { id, gdID, updateData } = this.props;
        const traceColNames = ["hovertext", "text", "x", "y"];
        var graphDiv = document.getElementById(gdID)
        var index, trace;
        if (graphDiv && Array.isArray(updateData) && updateData.length > 1) {
            // the plotly graph div is the second child-div fo the DASH dcc graph
            graphDiv = graphDiv.getElementsByClassName('js-plotly-plot')[0];

            // TODO -> do not apply this restyling in a for loop but just restructure
            // the data in a new object and then call once:
            //      Plotly.restyle(gd, newData, trace_indices)
            for (let i = 1; i < updateData.length; i++) {
                trace = updateData[i];
                // get the trace it's index and delete it
                index = trace.index
                delete trace.index;
                if (trace != null && index != null) {
                    // put everythin in the right format
                    traceColNames.forEach(
                        colName => {
                            if (trace[colName] == null) {
                                delete trace[colName];
                            }
                            else if (Array.isArray(trace[colName])) {
                                trace[colName] = [trace[colName]];
                            }
                        }
                    )
                    // console.log("restyle trace" + new Date().toLocaleTimeString());
                    Plotly.restyle(graphDiv, trace, index);
                };
            };
            // Apply the updated layout after the restyling took place
            Plotly.relayout(graphDiv, updateData[0]);
        };
        return <div id={id}></div>;
    }
}

TraceUpdater.defaultProps = {};

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
     *The data to update the graph with, must contain the `index` property for 
     * each trace; either a list of dict-traces or a single trace
     */
    updateData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func
};
