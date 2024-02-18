<script lang="ts">
	import { computeOverlap, hasOverlap, type Trip } from '$lib/triplib';
	import * as D from '$lib/datelib';
	import type { Eligibility } from '$lib/eligibility-calculator';

	export let trips: Trip[];
	export let eligibility: Eligibility | undefined;

	let newTripStartDate: Date | null = null;
	let newTripEndDate: Date | null = null;

	const addTrip = () => {
		trips = [...trips, { startDate: newTripStartDate!, endDate: newTripEndDate! }].toSorted(
			(trip1, trip2) => trip1.startDate.getTime() - trip2.startDate.getTime()
		);

		newTripStartDate = null;
		newTripEndDate = null;
	};

	const deleteTrip = (tripIdxToDelete: number) => () => {
		trips = trips.filter((_, tripIdx) => tripIdx !== tripIdxToDelete);
	};

	const deriveError = (startDate: Date | null, endDate: Date | null, trips: Trip[]) => {
		if (startDate === null || endDate === null) {
			return undefined;
		}

		if (startDate.getTime() > endDate.getTime()) {
			return `start date (${D.renderDate(startDate)}) is later than end date (${D.renderDate(endDate)})`;
		}

		for (const trip of trips) {
			if (hasOverlap(trip, { startDate, endDate })) {
				return `new trip [${D.renderDate(startDate)}..${D.renderDate(endDate)}] overlaps with existing trip [${D.renderDate(trip.startDate)}..${D.renderDate(trip.endDate)}]`;
			}
		}

		return undefined;
	};

	$: error = deriveError(newTripStartDate, newTripEndDate, trips);
</script>

<table>
	<thead>
		<th> Start Date </th>
		<th> End Date </th>
		{#if eligibility !== undefined}
			<th>Number of valid days</th>
		{/if}
		<th> &nbsp; </th>
	</thead>
	<tbody>
		{#each trips as trip, key}
			<tr>
				<td>{D.renderDate(trip.startDate)}</td>
				<td>{D.renderDate(trip.endDate)}</td>

				{#if eligibility != undefined}
					<td
						>{computeOverlap(trip, {
							startDate: eligibility.windowStartDate,
							endDate: eligibility.windowEndDate
						})}</td
					>
				{/if}
				<td>
					<button on:click={deleteTrip(key)}> Delete Trip </button>
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<hr />

{#if error !== undefined}
	<h3>Error: {error}</h3>
{/if}

<input
	type="date"
	name="newTripStartDate"
	on:change={(ev) => (newTripStartDate = ev.currentTarget.valueAsDate)}
/>
<input
	type="date"
	name="newTripEndDate"
	on:change={(ev) => (newTripEndDate = ev.currentTarget.valueAsDate)}
/>
<button
	disabled={newTripStartDate === null || newTripEndDate === null || error !== undefined}
	on:click={addTrip}
>
	Add Trip
</button>
