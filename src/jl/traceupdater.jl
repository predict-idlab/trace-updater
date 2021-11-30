# AUTO GENERATED FILE - DO NOT EDIT

export traceupdater

"""
    traceupdater(;kwargs...)

A TraceUpdater component.
ExampleComponent is an example component.
It takes a property, `aim`, and displays it.
It renders an input with the property `value`
which is editable by the user.
Keyword arguments:
- `id` (String; optional): The ID used to identify this component in Dash callbacks.
- `gdID` (String; required): The id of the graph-div whose traces should be
- `updateData` (Array | Dict; optional): The data to update the graph with, must contain the `index` property for 
each trace; either a list of dict-traces or a single trace
"""
function traceupdater(; kwargs...)
        available_props = Symbol[:id, :gdID, :updateData]
        wild_props = Symbol[]
        return Component("traceupdater", "TraceUpdater", "trace_updater", available_props, wild_props; kwargs...)
end

