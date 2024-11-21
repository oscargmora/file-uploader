export default async function landingGet(req, res) {
	res.render("landing", {
		title: "MoraDrive",
	});
}
