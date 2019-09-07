$(() => {
	// Setup add artefact button
	$('#PageButtonAddArtefact').on('click', (e) => {
		// Show add artefact dialog
		const dialogAddArtefact = document.getElementById('DialogAddArtefact');
		if (dialogAddArtefact) {
			dialogAddArtefact.show();
		}
	});

	function createChip(image, text) {
		return $(`
			<div class="chip">
				<img class="chip-image"
					src='${image}'
					alt='${text}' />
				<span class="chip-text">
					${text}
				</span>
			</div>
		`);
	}

	// Setup view artefact buttons
	$('.page-artefact').on('click', (e) => {
		const $button = $(e.target);
		const artefactId = $button.attr('data-artefact-id');
		// Show view artefact dialog
		const dialogViewArtefact = document.getElementById('DialogViewArtefact');
		if (dialogViewArtefact && artefactId) {
			$('#ArtefactViewName').html('');
			$('#ArtefactViewDescription').html('');
			$('#ArtefactViewImage').attr('src', '');
			$('#ArtefactViewImage').attr('alt', '');
			$('#ArtefactViewOwnerImage').attr('src', '');
			$('#ArtefactViewOwnerImage').attr('alt', '');
			$('#ArtefactViewOwnerText').html('');
			$('#ArtefactViewButtonShare').css('display', 'none');
			$('#ArtefactViewViewersContainer').css('display', 'none');
			$('#ArtefactViewViewers').html('');
			$('#ArtefactViewEditPanel').css('display', 'none');
			// Create loading dialog
			const loadingDialog = window.dialogManager.createNewLoadingDialog('Loading Artefact');
			loadingDialog.show();
			// Get and show artefact data
			$.get(`/artefact/${artefactId}`, (artefact) => {
				loadingDialog.hideAndRemove();
				dialogViewArtefact.show();
				// Get image url
				let imageUrl = '';
				let imageFilename = '';
				if (artefact.images && artefact.images.item) {
					imageUrl = artefact.images.item.url;
					imageFilename = artefact.images.item.filename;
				}

				// Set fields
				$('#ArtefactViewName').html(artefact.name);
				$('#ArtefactViewDescription').html(artefact.description);
				$('#ArtefactViewImage').attr('src', imageUrl);
				$('#ArtefactViewImage').attr('alt', imageFilename);
				$('#ArtefactViewOwnerImage').attr('src', artefact.owner.display_picture);
				$('#ArtefactViewOwnerImage').attr('alt', artefact.owner.display_name);
				$('#ArtefactViewOwnerText').html(artefact.owner.display_name);
				$('#ArtefactViewButtonShare').css('display', artefact.isOwner ? '' : 'none');
				$('#ArtefactViewEditPanel').css('display', artefact.isOwner ? '' : 'none');
				// Add viewer chips
				$('#AddViewersShareId').val(artefact._id);
				$('#AddViewersShareName').html(artefact.name);
				if (artefact.viewers && artefact.viewers.length > 0) {
					$('#ArtefactViewViewersContainer').css('display', '');
					artefact.viewers.forEach((viewer) => {
						// Create and add a viewer chip to the dialog
						const chipImage = viewer.display_picture;
						const chipName = viewer.display_name;
						$('#ArtefactViewViewers').append(createChip(chipImage, chipName));
					});
				}

				// Set add viewers button action
				$('#ArtefactViewButtonShare').off('click');
				$('#ArtefactViewButtonShare').on('click', () => {
					dialogViewArtefact.hide();
					// Show add viewers dialog
					const dialogAddViewers = document.getElementById('DialogAddViewers');
					if (dialogAddViewers) {
						$('#AddViewersSearchResult').html('');
						dialogAddViewers.show();
					}
				});

				// Set edit button action
				$('#ArtefactViewButtonEdit').off('click');
				$('#ArtefactViewButtonEdit').on('click', () => {
					dialogViewArtefact.hide();
					// Show edit artefact dialog
					const dialogEditArtefact = document.getElementById('DialogEditArtefact');
					$('#EditArtefactId').val(artefact._id);
					$('#EditArtefactName').val(artefact.name);
					$('#EditArtefactDescription').val(artefact.description);
					$('#EditArtefactImageName').val(imageFilename);
					$('#EditArtefactDeleteId').val(artefact._id);
					dialogEditArtefact.show();
				});
			}).fail((jqXHR, err, data) => {
				loadingDialog.hideAndRemove();
				// Show error dialog
				const errorDialog = window.dialogManager.createNewErrorDialog(`
					Could not load information for artefact.
				`);

				errorDialog.show();
			});
		}
	});


	// Setup search function
	function searchUsers() {
		$('#AddViewersSearchResult').html('');
		// Get search query
		const query = $('#AddViewersInputSearch').val();
		const artefactId = $('#AddViewersShareId').val();
		// Create loading dialog
		const loadingDialog = window.dialogManager.createNewLoadingDialog('Searching for Users');
		loadingDialog.show();
		// Make search
		$.get(`/user/search/${query}`, (users) => {
			loadingDialog.hideAndRemove();
			if (users && users.length > 0) {
				// Add table for users
				const searchResult = $('#AddViewersSearchResult');
				const userTable = $('<table class="user-results"></table>').appendTo(searchResult);
				// Add head
				$(`
				<thead>
					<tr>
						<th></th>
						<th>Name</th>
						<th>Email</th>
						<th></th>
					</tr>
				</thead>
				`).appendTo(userTable);

				// Add body
				const userBody = $('<tbody></tbody>').appendTo(userTable);
				users.forEach((user) => {
					const userRow = $(`
					<tr>
						<td><img class="user-picture" src="${user.display_picture}" alt="${user.display_name}" /></td>
						<td>${user.display_name}</td>
						<td>${user.email}</td>
					</tr>
					`).appendTo(userBody);

					const userButton = $(`
					<td>
						<button class="button button-inline" style="margin-left: auto;">Share with User</button>
					</td>
					`).appendTo(userRow);

					userButton.on('click', (e) => {
						// Create loading dialog
						const loadingDialogAddUser = window.dialogManager.createNewLoadingDialog(`Adding ${user.display_name}`);
						loadingDialogAddUser.show();
						$.post('/artefact/share/add', { viewerId: user._id, id: artefactId }, (data) => {
							loadingDialogAddUser.hideAndRemove();
							const errorDialog = window.dialogManager.createNewMessageDialog('Viewer Added', `
								${user.display_name} has been added as a viewer for this artefact.
							`);
							errorDialog.show();
						}).fail((jqXHR, err, data) => {
							loadingDialogAddUser.hideAndRemove();
							const errorDialog = window.dialogManager.createNewErrorDialog(`${jqXHR.responseText}`);
							errorDialog.show();
						});
					});
				});
			} else {
				const errorDialog = window.dialogManager.createNewErrorDialog('No results found');
				errorDialog.show();
			}
		}).fail((jqXHR, err, data) => {
			loadingDialog.hideAndRemove();
			const errorDialog = window.dialogManager.createNewErrorDialog(`${jqXHR.responseText}`);
			errorDialog.show();
		});
	}

	// Setup search on enter in input search
	$('#AddViewersInputSearch').on('keydown', (e) => {
		if (e.key === 'Enter') {
			searchUsers();
		}
	});

	// Setup search button
	$('#AddViewersButtonSearch').on('click', (e) => {
		searchUsers();
	});
});
