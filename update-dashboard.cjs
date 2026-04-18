const fs = require('fs');
const content = fs.readFileSync('src/routes/dashboard/+page.svelte', 'utf8');
let newContent = content.replace(
`		client = profile;
		entries = getClientDailyEntries(profile.id);
		const todayEntry = entries.find((entry) => entry.date === today);

		form = {
			calories: todayEntry?.calories ?? profile.targetCalories,
			protein: todayEntry?.protein ?? profile.targetProtein,
			trainingCompleted: todayEntry?.trainingCompleted ?? false,
			weight: todayEntry?.weight ?? '',
			notes: todayEntry?.notes ?? ''
		};
		loading = false;
		setTimeout(renderWeightChart, 0);
	});`,
`		client = profile;
		getClientDailyEntries(profile.id).then(fetchedEntries => {
			entries = fetchedEntries;
			const todayEntry = entries.find((entry) => entry.date === today);

			form = {
				calories: todayEntry?.calories ?? profile.targetCalories,
				protein: todayEntry?.protein ?? profile.targetProtein,
				trainingCompleted: todayEntry?.trainingCompleted ?? false,
				weight: todayEntry?.weight ?? '',
				notes: todayEntry?.notes ?? ''
			};
			loading = false;
			setTimeout(renderWeightChart, 0);
		});
	});`
);

newContent = newContent.replace(
`	function refreshEntries() {
		if (!client) return;
		entries = getClientDailyEntries(client.id);
		setTimeout(renderWeightChart, 0);
	}`,
`	function refreshEntries() {
		if (!client) return;
		getClientDailyEntries(client.id).then(fetchedEntries => {
			entries = fetchedEntries;
			setTimeout(renderWeightChart, 0);
		});
	}`
);

newContent = newContent.replace(
`		saveDailyEntry({
			clientId: client.id,
			date: today,
			calories: Number(form.calories),
			protein: Number(form.protein),
			trainingCompleted: form.trainingCompleted,
			weight: form.weight === '' ? null : Number(form.weight),
			notes: form.notes
		});`,
`		await saveDailyEntry({
			clientId: client.id,
			date: today,
			calories: Number(form.calories),
			protein: Number(form.protein),
			trainingCompleted: form.trainingCompleted,
			weight: form.weight === '' ? null : Number(form.weight),
			notes: form.notes
		});`
);

fs.writeFileSync('src/routes/dashboard/+page.svelte', newContent);