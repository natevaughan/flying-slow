<script>
    import {maxBy, minBy} from "./utils";
    import {min} from 'd3'

    export let name;
    export let performanceData;
    $: maxEcon = minBy(performanceData, 'Speed')
    $: maxCruise = maxBy(performanceData, 'Speed')

    function roundNumber(num, dec) {
        return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    }
</script>
<style>
    .row {
        margin-top: 4px;
        margin-bottom: 4px;
        font-family: "Courier New", Courier, fixed-width;
    }
</style>
<div class="row">
    <h3>{name}</h3>
    <div>400-NM Seats: {min([performanceData[0]["400NMSeats"], performanceData[0]["Seats"]])}</div>

    <div>Econ cruise: {maxEcon.Speed} kts @  {maxEcon.Burn} gph <a href={maxEcon.Source}>(source)</a></div>
    <div>Max cruise: {maxCruise.Speed} kts @ {maxCruise.Burn} gph <a href={maxCruise.Source}>(source)</a></div>
</div>