import { isElement } from "lodash";

export function getGraphDiv(gdID) {
    // see this link for more information https://stackoverflow.com/a/34002028
    let graphDiv = document?.querySelectorAll('div[id*="' + gdID + '"][class*="dash-graph"]');
    if (graphDiv.length > 1) {
        throw new SyntaxError("LayoutUpdater: multiple graphs with ID=\"" + gdID + "\" found; n=" + graphDiv.length + " \n(either multiple graphs with same ID's or current ID is a str-subset of other graph IDs)");
    } else if (graphDiv.length < 1) {
        throw new SyntaxError("LayoutUpdater: no graphs with ID=\"" + gdID + "\" found");
    }
    graphDiv = graphDiv?.[0]?.getElementsByClassName('js-plotly-plot')?.[0];
    if (!isElement(graphDiv)) {
        throw new Error(`Invalid gdID '${gdID}'`);
    }
    return graphDiv;
}


Function.prototype.clone = function () {
    let cloneObj = this;
    if (this.__isClone) {
        cloneObj = this.__clonedFrom;
    }
    let temp = function () { return cloneObj.apply(this, arguments); };
    for (let key in this) {
        temp[key] = this[key];
    }
    temp.__isClone = true;
    temp.__clonedFrom = cloneObj;
    return temp;
};

export async function removeApplyRelayoutEvent(graphDiv, updateData) {
    let relayout_func = graphDiv._ev._events.plotly_relayout;
    if (Array.isArray(relayout_func)) { relayout_func = relayout_func[0]; };
    if (relayout_func == undefined) {
        console.log('no relayout_func found for ' + graphDiv.parentNode.id);
        return idDiv;
    }
    relayout_func = relayout_func.clone();
    // console.log("relayout_func get: ", graphDiv.parentNode.id, relayout_func);
    await graphDiv.removeAllListeners('plotly_relayout');
    await Plotly.relayout(graphDiv, updateData);
    console.log("relayout_func set: ", graphDiv.parentNode.id, " ", relayout_func);
    await graphDiv.on('plotly_relayout', relayout_func);
};