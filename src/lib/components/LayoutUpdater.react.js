import { Component } from 'react';
import PropTypes from 'prop-types';
import { getGraphDiv, removeApplyRelayoutEvent } from '../utils/updaterUtils';



/**
 * LayoutUpdater is a component which updates the layout of a plotly graph.
 */
export default class LayoutUpdater extends Component {
    static #previousLayout = {};

    shouldComponentUpdate({ updateData }) {
        return typeof updateData == 'object' && LayoutUpdater.#previousLayout !== updateData;
    }

    render() {
        const { id, gdID, updateData, triggerRelayout } = this.props;
        const idDiv = <div id={id}></div>;
        if (!this.shouldComponentUpdate(this.props)) {
            console.log("LayoutUpdater " + gdID + ": no update required");
            console.log("LayoutUpdater no update: updateData: " + updateData);
            return idDiv;
        }
        console.log("LayoutUpdater " + gdID + ": update required");
        console.log("LayoutUpdater update: updateData: " + updateData);

        LayoutUpdater.#previousLayout = updateData;
        let trgrRelayout = triggerRelayout;
        if (updateData.hasOwnProperty('triggerRelayout')) {
            trgrRelayout =updateData.triggerRelayout;
            delete updateData.triggerRelayout;
        }

        let graphDiv = getGraphDiv(gdID);
        if (trgrRelayout === true) { Plotly.relayout(graphDiv, updateData); }
        else { removeApplyRelayoutEvent(graphDiv, updateData); }
        return idDiv;
    }
}

LayoutUpdater.defaultProps = {
    triggerRelayout: false,
};

LayoutUpdater.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * The id of the graph-div whose layout will be updated.
     *
     * .. Note:
     *
     *   * if you use multiple graphs; each graph MUST have a unique id; otherwise we
     *     cannot guarantee that resampling will work correctly.
     *   * LayoutUpdater will determine the html-graph-div by performing partial matching
     *     on the "id" property (using `gdID`) of all divs with classname="dash-graph".
     *     It will select the first item of that match list; so if multiple same
     *     graph-div IDs are used, or one graph-div-ID is a subset of the other (partial
     *     matching) there is no guarantee that the correct div will be selected.
     */
    gdID: PropTypes.string.isRequired,

    /**
     * Whether a Relayout will be triggered after the update or not.
     */
    triggerRelayout: PropTypes.bool,

    /**
     * The layout update data dict.
     * If this contains the `triggerRelayout` key, it will be used to determine whether
     * a relayout-event will be triggered or not.
     */
    updateData: PropTypes.object,

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func
};
