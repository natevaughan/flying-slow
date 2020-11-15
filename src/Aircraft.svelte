<script>
    export let aircraft;
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
    <h3>{aircraft.Airplane}</h3>
    <div>Seats: {aircraft.Seats}</div>
    <div>SMPG: {aircraft.SMPG}</div>
    <div>Econ cruise speed: <a href={aircraft.Source}>{aircraft.Speed} kts</a></div>
    <div>MDW &rarr; BNA: {roundNumber(343 / aircraft.Speed, 1)} hrs</div>
</div>