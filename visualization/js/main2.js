{

  var dimredmethod = "PCA";
  var modelselection = "MF";
  var data;
  var columns;

  function drawDimRedMax() {

    const dimensions = {
      margin: 30,
      outerHeight: 700,
      circle_radius: 4
    }

    element = d3.select( "#dimred-max" );
    drawDimRed( element, dimredmethod, modelselection, dimensions );

  }

  function drawDimRedMins() {

    const dimensions = {
      margin: 15,
      outerHeight: 150,
      circle_radius: 2
    }

    element = d3.select( "#pca-min" );
    drawDimRed( element, "PCA", modelselection, dimensions );

    element = d3.select( "#tsne-min" );
    drawDimRed( element, "TSNE", modelselection, dimensions );

    element = d3.select( "#umap-min" );
    drawDimRed( element, "UMAP", modelselection, dimensions );

  }

  function drawDimRed( element, dimredmethod, modelselection, dimensions ) {

    const margin = dimensions.margin,
      outerWidth = element.node().getBoundingClientRect().width,
      outerHeight = dimensions.outerHeight,
      width = outerWidth - margin - margin,
      height = outerHeight - margin - margin,
      circle_radius = dimensions.circle_radius;
  
    const color = d3.scaleOrdinal( d3.schemeCategory10 );

    var x = d3.scaleLinear()
      .range( [ 0, width ] ).nice();

    var y = d3.scaleLinear()
      .range( [ height, 0 ] ).nice();

    var xMax = d3.max( data, ( d ) => { return +d[ dimredmethod + '_' + modelselection + '_X' ]; } ),
      xMin = d3.min( data, ( d ) => { return +d[ dimredmethod + '_' + modelselection + '_X' ]; } ),
      yMax = d3.max( data, ( d ) => { return +d[ dimredmethod + '_' + modelselection + '_Y' ]; } ),
      yMin = d3.min( data, ( d ) => { return +d[ dimredmethod + '_' + modelselection + '_Y' ]; } );

    x.domain( [ xMin, xMax ] );
    y.domain( [ yMin, yMax ] );

    element.html( "" );

    svg = element
      .append( "svg" )
        .attr( "width", outerWidth )
        .attr( "height", outerHeight )
      .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")");

    svg.append( "rect" )
      .attr( "width", width )
      .attr( "height", height )
      .style( "margin", margin )
      .style( "fill", "none" )
      .style( "pointer-events", "all" );

    var g = svg.selectAll( ".b" )
      .data( data )
      .enter().append( "g" )
      .attr("class", "u" );

    g.append( "circle" )
      .attr( "cx", d => x( +d[ dimredmethod + '_' + modelselection + '_X' ] ) )
      .attr( "cy", d => y( +d[ dimredmethod + '_' + modelselection + '_Y' ] ) )
      .attr( "r", circle_radius )
      .style( "fill", (d) => color( d[ modelselection + '_CLUSTER' ] ) );

    g.append( "title" )
      .text( d => { return d.COUNTRY + " - " + d.L2NAME; } );

  }

  function drawParallelCoords() {

    var spec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v2.4.3.json",
      "repeat": {
        "column": columns
      },
      "config": {
        "view": {
          "width": 100,
          "height": 300
        }
      },
      "spec": {
        "encoding": {
          "color": {
            "condition": {
              "field": "MF_CLUSTER",
              "selection": "selector057",
              "type": "nominal"
            },
            "value": "gray"
          },
          "x": {
            "field":"selected",
            // "aggregate": "count",
            "type": "nominal"
          },
          "tooltip": [
            {
              "field": "COUNTRY",
              "type": "nominal"
            },
            {
              "field": "L2NAME",
              "type": "nominal"
            }
          ],
          "y": {
            // "bin": true,
            "field": {
              "repeat": "column"
            },
            "scale": { "zero": false },
            "type": "quantitative"
          },
          // "column": {"field": "clase", "type": "nominal"}
        },
        "width": 60,
        "mark": { "type":"tick","opacity": "0.4" },
        "selection": {
          "selector057": {
            "resolve": "global",
            "type": "interval"
          }
        },
        "data": {
          "name": "dataList"
        },
        "height": 150
      }
    };

    var embed_opt = { "mode": "vega-lite" };

    function showError( el, error ) {
      el.innerHTML = ( '<div class="error">'
                      + '<p>JavaScript Error: ' + error.message + '</p>'
                      + "<p>This usually means there's a typo in your chart specification. "
                      + "See the javascript console for the full traceback.</p>"
                      + '</div>' );
      throw error;
    }

    var view;

    renderVegaLite( spec );

    function renderVegaLite( spec ) {
      console.log( "render vega" );

      var vgSpec = vl.compile( spec ).spec;
      
      view = new vega.View( vega.parse( vgSpec ) )
        .logLevel( vega.Warn )
        .renderer( "canvas" )
        .initialize( document.querySelector( "#parallel" ) )
        .insert( "dataList", data )
        .hover()
        .run();

    }

  }

  d3.csv( "../data/modelos_l2.csv" )
    .then( ( data2 ) => {
      data = data2;
      console.log( "Data loaded successfully" );
      columns = data.columns.slice( 18, 49 );
      drawDimRedMax();
      drawDimRedMins();
      drawParallelCoords( data, columns );

    });

  d3.selectAll( ( ".dimred-min" ) ).on( "click", function() {
    id = d3.select( this ).attr( 'id' );
    dimredmethod = id.split( "-" )[ 0 ].toUpperCase();
    console.log( dimredmethod + " method selected" );
      
    d3.selectAll( ( ".dimred-min" ) )
      .classed( "selected", false );

    d3.select( this )
      .classed( "selected", true );

    drawDimRedMax();
  });

  d3.select( ( "#modelselection" ) ).on( "change", function() {
    modelselection = this.value;
    console.log( modelselection + " model selected" );
    drawDimRedMax();
    drawDimRedMins();
  } );

}