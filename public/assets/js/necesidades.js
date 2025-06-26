import { vistas } from './utils/baseUrl.js';
// Funcionalidad completa para el catálogo de necesidades
document.addEventListener('DOMContentLoaded', function () {
    // Referencias a elementos del DOM
    const filtroCategoria = document.getElementById('filtroCategoria');
    const filtroUrgencia = document.getElementById('filtroUrgencia');
    const filtroOrganizacion = document.getElementById('filtroOrganizacion');
    const busqueda = document.getElementById('busqueda');
    const catalogoContainer = document.getElementById('catalogoNecesidades');
    const contadorTotal = document.querySelector('.badge.bg-dark');

    // Ajax
    const necesidades = async () => {
        let vista = await vistas('necesidades/card');

        necesidadesOriginales = await vista.data
        necesidadesFiltradas = [...necesidadesOriginales];

        mostrarNecesidades();
        actualizarPaginacion();
        actualizarContador();
    }

    // Variables para paginación
    let paginaActual = 1;
    const elementosPorPagina = 6;
    let necesidadesFiltradas = [];

    // Datos originales de las necesidades (extraídos del HTML)
    let necesidadesOriginales = [];

    necesidades();

    // Event listeners para filtros
    filtroCategoria.addEventListener('change', aplicarFiltros);
    filtroUrgencia.addEventListener('change', aplicarFiltros);
    filtroOrganizacion.addEventListener('change', aplicarFiltros);
    busqueda.addEventListener('input', aplicarFiltros);

    // Función principal para aplicar filtros
    function aplicarFiltros() {
        const categoria = filtroCategoria.value;
        const urgencia = filtroUrgencia.value;
        const tipoOrg = filtroOrganizacion.value;
        const textoBusqueda = busqueda.value.toLowerCase().trim();

        necesidadesFiltradas = necesidadesOriginales.filter(necesidad => {
            // Filtro por categoría
            const pasaCategoria = !categoria || necesidad.categoria === categoria;

            // Filtro por urgencia
            const pasaUrgencia = !urgencia || necesidad.urgencia === urgencia;

            // Filtro por tipo de organización
            const pasaTipoOrg = !tipoOrg || necesidad.tipoOrg === tipoOrg;

            // Filtro por búsqueda de texto
            const pasaBusqueda = !textoBusqueda ||
                necesidad.titulo.toLowerCase().includes(textoBusqueda) ||
                necesidad.organizacion.toLowerCase().includes(textoBusqueda) ||
                necesidad.ubicacion.toLowerCase().includes(textoBusqueda) ||
                necesidad.descripcion.toLowerCase().includes(textoBusqueda);

            return pasaCategoria && pasaUrgencia && pasaTipoOrg && pasaBusqueda;
        });

        paginaActual = 1; // Resetear a primera página
        mostrarNecesidades();
        actualizarPaginacion();
        actualizarContador();
    }

    // Función para mostrar las necesidades
    function mostrarNecesidades() {
        const inicio = (paginaActual - 1) * elementosPorPagina;
        const fin = inicio + elementosPorPagina;
        const necesidadesPagina = necesidadesFiltradas.slice(inicio, fin);

        catalogoContainer.innerHTML = '';

        if (necesidadesPagina.length === 0) {
            catalogoContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-info">
                        <h4>No se encontraron resultados</h4>
                        <p>No hay necesidades que coincidan con los filtros seleccionados.</p>
                        <button class="btn btn-warning" onclick="limpiarFiltros()">Limpiar Filtros</button>
                    </div>
                </div>
            `;
            return;
        }

        necesidadesPagina.forEach(necesidad => {
            const card = crearCardNecesidad(necesidad);
            catalogoContainer.appendChild(card);
        });
    }

    // Función para crear una card de necesidad
    function crearCardNecesidad(necesidad) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';

        const urgenciaClass = {
            'alta': 'bg-danger',
            'media': 'bg-warning text-dark',
            'baja': 'bg-info'
        };

        const urgenciaText = {
            'alta': 'Alta urgencia',
            'media': 'Urgencia media',
            'baja': 'Baja urgencia'
        };

        col.innerHTML = `
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="card-title fw-bold">${necesidad.nombre_necesidad}</h5>
                        <span class="badge ${urgenciaClass[necesidad.prioridad]}">${urgenciaText[necesidad.prioridad]}</span>
                    </div>
                    <p class="card-text mb-2"><strong>Organización:</strong> ${necesidad.razon_social}</p>
                    <p class="card-text mb-2"><strong>Ubicación:</strong> ${necesidad.direccion}</p>
                    <p class="card-text text-muted mb-3">${necesidad.descripcion_corta}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-secondary">${necesidad.categoria}</span>
                        <button class="btn btn-warning btn-sm text-dark fw-semibold" onclick="donarAhora('${necesidad.razon_social}')">Donar Ahora</button>
                    </div>
                </div>
            </div>
        `;

        return col;
    }

    // Función para actualizar la paginación
    function actualizarPaginacion() {
        const totalPaginas = Math.ceil(necesidadesFiltradas.length / elementosPorPagina);
        const paginacion = document.querySelector('.pagination');

        if (totalPaginas <= 1) {
            paginacion.parentElement.style.display = 'none';
            return;
        }

        paginacion.parentElement.style.display = 'block';
        paginacion.innerHTML = '';

        // Botón Anterior
        const anteriorLi = document.createElement('li');
        anteriorLi.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
        anteriorLi.innerHTML = `<a class="page-link" href="#" data-pagina="${paginaActual - 1}">Anterior</a>`;
        paginacion.appendChild(anteriorLi);

        // Números de página
        for (let i = 1; i <= totalPaginas; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-pagina="${i}">${i}</a>`;
            paginacion.appendChild(li);
        }

        // Botón Siguiente
        const siguienteLi = document.createElement('li');
        siguienteLi.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
        siguienteLi.innerHTML = `<a class="page-link" href="#" data-pagina="${paginaActual + 1}">Siguiente</a>`;
        paginacion.appendChild(siguienteLi);

        // Event listeners para paginación
        paginacion.addEventListener('click', function (e) {
            e.preventDefault();
            const pagina = parseInt(e.target.dataset.pagina);

            if (pagina && pagina !== paginaActual && pagina >= 1 && pagina <= totalPaginas) {
                paginaActual = pagina;
                mostrarNecesidades();
                actualizarPaginacion();
                // Scroll al inicio del catálogo
                catalogoContainer.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Función para actualizar el contador
    function actualizarContador() {
        contadorTotal.textContent = `Total: ${necesidadesFiltradas.length} necesidades`;
    }

    // Función para limpiar filtros (disponible globalmente)
    window.limpiarFiltros = function () {
        filtroCategoria.value = '';
        filtroUrgencia.value = '';
        filtroOrganizacion.value = '';
        busqueda.value = '';
        aplicarFiltros();
    };

    // Función para el botón "Donar Ahora" (disponible globalmente)
    window.donarAhora = function (titulo) {
        alert(`Funcionalidad de donación para: ${titulo}\n\nEsta función se conectaría con el sistema de donaciones.`);
        // Aquí se implementaría la lógica real de donación
    };

    // Manejo del Enter en el campo de búsqueda
    busqueda.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            aplicarFiltros();
        }
    });

    // Inicializar contador
    actualizarContador();
});