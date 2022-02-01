var data;

const convertToTimeseries = (data) => {
    var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    return data.map(
        entry => { 
            return {x: new Date(entry.timestamp*1000).toLocaleString("en-US", {year: 'numeric', month: 'numeric', day: 'numeric' }), y: entry.price}
        } 
    )
}

const reduceToAvgPerKey = (data) => {
    var tmp = {};
    data.forEach((item) => {
        if(!(item.x in tmp)){
            tmp[item.x] = {count: 0, total:0};
        } 
        tmp[item.x].count++;
        tmp[item.x].total+= parseFloat(item.y)
    });
    return Object.entries(tmp).map((entry) => { return { x: entry[0], y: entry[1].total/entry[1].count} })
}

const plotTimeSeries = (where, data, label) => {
    const ctx = document.getElementById(where).getContext('2d');
    const config = {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          data: reduceToAvgPerKey(convertToTimeseries(data)),
          label: label,
          borderColor: "green",
          fill: false,
          borderWidth: 3
        }]
      },
      options: {
        elements: {
            point:{
                radius: 0
            }
        }
      }
    };
    new Chart(ctx, config);
};


const getLastMonthData = async (base, quote) => {
    const response = await fetch('https://api.blockchain.info/price/index-series?base='+base+'&quote='+quote+'&start=1636236000&scale=7200&cors=true');
    data = await response.json();
    document.getElementById("raw-data").textContent = data;
    plotTimeSeries('chart', data, "Price of " + base + " (" + quote + ")");
}

window.onload = function () {
    getLastMonthData("BTC", "USD");
}
