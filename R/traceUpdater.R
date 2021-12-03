# AUTO GENERATED FILE - DO NOT EDIT

traceUpdater <- function(id=NULL, gdID=NULL, sequentialUpdate=NULL, updateData=NULL) {
    
    props <- list(id=id, gdID=gdID, sequentialUpdate=sequentialUpdate, updateData=updateData)
    if (length(props) > 0) {
        props <- props[!vapply(props, is.null, logical(1))]
    }
    component <- list(
        props = props,
        type = 'TraceUpdater',
        namespace = 'trace_updater',
        propNames = c('id', 'gdID', 'sequentialUpdate', 'updateData'),
        package = 'traceUpdater'
        )

    structure(component, class = c('dash_component', 'list'))
}
