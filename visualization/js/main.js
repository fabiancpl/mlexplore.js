/* global d3, tsnejs, vega */

const categoricalAttributes = "clase,probclase1,probclase2,probclase3,Country,L1Name,L2Namev2".split(",");
const color = d3.scaleOrdinal(d3.schemeCategory10);
const width = 800,
  height= 600;
let perplexity = 110,
  epsilon = 40,
  timer,
  quadtree,
  zoomLevel = 10,
  stepCount = 0;





function redraw(data) {
  const columns = data.columns
    .filter(c=> categoricalAttributes.indexOf(c)===-1);
  // data = data.filter(d=> d.Country !== "Panama" && d.Country !== undefined);
  var opt = {epsilon: epsilon, perplexity:perplexity}; // epsilon is learning rate (10 = default)
  var tsne = new tsnejs.tSNE(opt); // create a tSNE instance
  let svg, ss=1,
    tx = 0,
    ty = 0;

  let maxes = columns.map((c) => {
    return {
      column:c,
      max:d3.max(data, (d) => +d[c])
    };
  });


  let array = data.map((d,di) => {
    d.i=di;
    d.selected = false;
    // return columns.map((c,i) => +d[c]);
    return columns.map((c,i) => +d[c]/maxes[i].max);
  });

  console.log(array[0]);
  tsne.initDataRaw(array);
  for (let i=0; i<100; i++)
    tsne.step();
  updateQuadTree();
  drawEmbedding(); // draw initial embedding

  //T.debugGrad();
  if (timer) clearInterval(timer);

  timer = setInterval(step, 100);




  function updateQuadTree() {
    console.log("update quadtree", stepCount);

    var Y = tsne.getSolution();
    quadtree = d3.quadtree()
      .x((d) => {
        return Y[d.i][0]*zoomLevel + width/2;
      })
      .y((d) => {
        return Y[d.i][1]*zoomLevel + height/2;
      })
      .extent([[-width/20, -height/20], [width/20 + 1, height/20 + 1]])
      .addAll(data);
  }

  function updateEmbedding() {
    var Y = tsne.getSolution();


    if (stepCount %20 ===0) {
      updateQuadTree();

    }

    stepCount+=1;
    svg.selectAll(".u")
      .data(data)
      .attr("transform", function(d, i) { return "translate(" +
                                            ((Y[i][0]*zoomLevel*ss + tx) + width/2) + "," +
                                            ((Y[i][1]*zoomLevel*ss + ty) + height/2) + ")"; });
  }

  function drawEmbedding() {
    d3.select("#embed").html("");
    stepCount=0;

    // get min and max in each column of Y
    // var Y = tsne.Y;

    svg = d3.select("#embed").append("svg") // svg is global
      .attr("width", width)
      .attr("height", height);

    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .call(d3.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", zoomed));

    var g = svg.selectAll(".b")
      .data(data)
      .enter().append("g")
      .attr("class", "u");

    g.append("circle")
      .attr("cx", 0)
      .attr("cy", 2)
      .attr("r", 4)
      .style("fill", d => color(d.clase));


    g.append("text")
      .attr("text-anchor", "top")
      .attr("font-size", 12)
      .attr("fill", "#333")
      .text(function(d) { return d.Country + " " + d.L1Name + " " + d.L2Namev2; });

    var brush = d3.brush()
      .on("start brush", brushed)
      .on("end", brushended);



    svg.append("g")
      .attr("class", "brush")
      .call(brush);

    drawParallelCoords(data);

    // Find the nodes within the specified rectangle.
    function search(quadtree, x0, y0, x3, y3) {
      let Y = tsne.getSolution();
      quadtree.visit(function(node, x1, y1, x2, y2) {
        if (!node.length) {
          do {
            var d = node.data;
            d.selected = ( (Y[d.i][0]*zoomLevel + width/2) >= x0 ) &&
              ( (Y[d.i][0]*zoomLevel + width/2) < x3) &&
              ( (Y[d.i][1]*zoomLevel + height/2) >= y0) &&
              ( (Y[d.i][1]*zoomLevel + height/2) < y3);
            node = node.next;
          } while (node);
        }
        return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
      });
    }

    function brushed() {
      var extent = d3.event.selection;

      g.each(function(d) { d.selected = false; });
      search(quadtree, extent[0][0], extent[0][1], extent[1][0], extent[1][1]);
      g.classed("u--selected", function(d) { return d.selected; });
      console.log(data.filter(d => d.selected).length);

      let selected = d3.select("#selected")
        .selectAll("p")
        .data(data.filter(d=> d.selected).slice(0,100));

      selected.enter()
        .append("p")
        .merge(selected)
        .text(d => d.Country + " " + d.L1Name + " " + d.L2Namev2 );

      selected.exit().remove();

      // drawParallelCoords(data.filter(d=> d.selected).reduce((accum, n) => {
      //   let res = columns.map( c => {
      //     return{
      //       clase: n.clase,
      //       Country: n.Country,
      //       L1Name: n.L1Name,
      //       L2Namev2: n.L2Namev2,
      //       variable: c,
      //       value: +n[c]
      //     };}
      //   );


    }

    function brushended() {
      drawParallelCoords(data);
      if (!d3.event.selection) {
        g.each(function(d) { d.selected = false; });
      }
    }


    function zoomed() {
      // console.log = d3.event.transform;
      tx = d3.event.transform.x;
      ty = d3.event.transform.y;
      ss = d3.event.transform.k;
      // g.attr("transform", d3.event.transform);
    }
  }

  function step() {
    for(var k=0;k<1;k++) {
      tsne.step(); // do a few steps
    }
    updateEmbedding();
  }
}

d3.csv("../data/datos.csv")
  .then((data) => {
    redraw(data);

    d3.select("#inPerplexity")
      .on("input", () => {
        perplexity = +d3.select("#inPerplexity").property("value");
        d3.select("#valPerplexity").text(perplexity);
      })
      .on("change", () => {
        perplexity = +d3.select("#inPerplexity").property("value");
        d3.select("#valPerplexity").text(perplexity);
        redraw(data);
      });
    d3.select("#inLearning")
      .on("input", () => {
        epsilon = +d3.select("#inLearning").property("value");
        d3.select("#valLearning").text(epsilon);
      })
      .on("change", () => {
        epsilon = +d3.select("#inLearning").property("value");
        d3.select("#valLearning").text(epsilon);
        redraw(data);
      });
  });

function drawParallelCoords(data) {
  var spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v2.4.3.json",
    "repeat": {
      "column": ["BECTUAREAL2", "BECCVPTCHAREAL2", "BECAWMNSHPINDXL2", "BECAWMNNNGHL2", "BECEFFMESHSIZEL2", "BECAWEDGDENSL2", "BECPOPDENSADJL2", "BECPRSBRTL2", "BECPRSSUBWAYL2", "BECADCRCTYAVGL2", "BECADINTDENSL2", "BECADSTTDENSL2", "BECURBTRVDELAYINDEXL2"]
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
            "field": "clase",
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
            "field": "Country",
            "type": "nominal"
          },
          {
            "field": "L1Name",
            "type": "nominal"
          },
          {
            "field": "L2Namev2",
            "type": "nominal"
          }
        ],
        "y": {
          // "bin": true,
          "field": {
            "repeat": "column"
          },
          "scale": {"zero": false},
          "type": "quantitative"
        },
        // "column": {"field": "clase", "type": "nominal"}
      },
      "width": 60,
      "mark": {"type":"tick","opacity": "0.4"},
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

  var embed_opt = {"mode": "vega-lite"};

  function showError(el, error){
    el.innerHTML = ('<div class="error">'
                    + '<p>JavaScript Error: ' + error.message + '</p>'
                    + "<p>This usually means there's a typo in your chart specification. "
                    + "See the javascript console for the full traceback.</p>"
                    + '</div>');
    throw error;
  }
  // const el = document.getElementById("parallel");
  // vegaEmbed("#parallel", spec, embed_opt)
    // .catch(error => showError(el, error));

  var view;

  renderVegaLite(spec);

  function renderVegaLite(spec) {
    console.log("render vega");

    var vgSpec = vl.compile(spec).spec;
    // console.log(vgSpec);
    view = new vega.View(vega.parse(vgSpec))
      .logLevel(vega.Warn)
      .renderer("canvas")  // set renderer (canvas or svg)
      .initialize(document.querySelector("#parallel")) // initialize view within parent DOM container
      .insert("dataList", data)
      .hover()             // enable hover encode set processing
      .run();

    // console.log(vega.parse(spec));

    // console.log("data", view.data("dataList"));
  }
  // parse(spec);

  // var view = new vega.View(runtime)
  //   .logLevel(vega.Warn) // set view logging level
  //   .initialize(document.querySelector('#view')) // set parent DOM element
  //   .renderer('svg') // set render type (defaults to 'canvas')
  //   .hover() // enable hover event processing
  //   .run(); // update and render the view
}