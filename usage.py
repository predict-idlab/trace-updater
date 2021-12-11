import trace_updater
import dash
from dash.dependencies import Input, Output
import plotly.graph_objs as go
from dash import html, dcc
from plotly_resampler import FigureResampler
from plotly_resampler.downsamplers import LTTB
import numpy as np

# Construct a high-frequency signal
n = 1_000_000
x = np.arange(n)
noisy_sin = (3 + np.sin(x / 200) + np.random.randn(len(x)) / 10) * x / 1_000

# Construct the to-be resampled figure
fig = FigureResampler(go.Figure())
fig.add_trace(go.Scattergl(name="noisy sine", showlegend=True), hf_x=x, hf_y=noisy_sin)


# Construct app & it's layout
app = dash.Dash(__name__)

app.layout = html.Div(
    [
        dcc.Graph(id="graph-id", figure=fig),
        trace_updater.TraceUpdater(id="trace-updater", gdID="graph-id"),
        html.Div(id="output"),
    ]
)

# Register the callback
fig.register_update_graph_callback(app, "graph-id", "trace-updater")


if __name__ == "__main__":
    app.run_server(debug=True)
