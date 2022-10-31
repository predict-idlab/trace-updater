
module TraceUpdater
using Dash

const resources_path = realpath(joinpath( @__DIR__, "..", "deps"))
const version = "0.0.9"

include("jl/traceupdater.jl")

function __init__()
    DashBase.register_package(
        DashBase.ResourcePkg(
            "trace_updater",
            resources_path,
            version = version,
            [
                DashBase.Resource(
    relative_package_path = "trace_updater.min.js",
    external_url = nothing,
    dynamic = nothing,
    async = nothing,
    type = :js
),
DashBase.Resource(
    relative_package_path = "trace_updater.min.js.map",
    external_url = nothing,
    dynamic = true,
    async = nothing,
    type = :js
)
            ]
        )

    )
end
end
