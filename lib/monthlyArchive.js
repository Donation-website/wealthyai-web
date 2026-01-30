export function saveMonthlySnapshot(snapshot) {
  const stored = JSON.parse(
    localStorage.getItem("monthlySnapshots") || "[]"
  );

  const exists = stored.find(
    s => s.date === snapshot.date
  );

  if (!exists) {
    stored.push(snapshot);
    localStorage.setItem(
      "monthlySnapshots",
      JSON.stringify(stored.slice(-30))
    );
  }
}

export function getMonthlySnapshots() {
  return JSON.parse(
    localStorage.getItem("monthlySnapshots") || "[]"
  );
}

export function getSnapshotByDay(cycleDay) {
  const all = getMonthlySnapshots();
  return all.find(s => s.cycleDay === cycleDay);
}
