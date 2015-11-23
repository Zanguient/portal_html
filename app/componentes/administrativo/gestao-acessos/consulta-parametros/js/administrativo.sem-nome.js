/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 17/11/2015
 *
 */

// App
angular.module("administrativo-sem-nome", [])
.controller("administrativo-sem-nomeCtrl", ['$scope',
																					 '$state',
																					 '$http',
																					 '$webapi',
																					 '$apis',
																					 '$filter',
																					 function($scope,$state,$http,$webapi,$apis,$filter){
																						 
																						 
 var divPortletBodyFilialPos = 0; // posição da div que vai receber o loading progress
 $scope.paginaInformada = 1; // página digitada pelo usuário
 $scope.vendas = [];
 $scope.filiais = [];
 $scope.adquirentes = [];
 $scope.itens_pagina = [50, 100, 150, 200];
 $scope.busca = ''; // model do input de busca
 $scope.venda = {busca:'', itens_pagina : $scope.itens_pagina[0], pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas :0};
 $scope.vendaSelecionada = undefined;
 $scope.filtro = {datamin : new Date(), datamax : '', data : 'Recebimento',
									filial : null, adquirente : null, bandeira : null,
									itens_pagina : $scope.itens_pagina[0], order : 0,
									busca : '', campo_busca : $scope.camposBusca[0],
									sintetico : { pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0},
									analitico : { pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0},
								 };
 $scope.abrirCalendarioDataMin = $scope.abrirCalendarioDataVendaMin = false;
 $scope.abrirCalendarioDataMax = $scope.abrirCalendarioDataVendaMax = false;
 $scope.totalVendas = 0;
 //Flags
 $scope.exibeTela = false;
 // Inicialização do controller
 $scope.administrativo_semNomeInit = function(){
	 //Título da página
	 $scope.pagina.titulo = "Sem Nome";
	 $scope.pagina.subtitulo = "Sem Nome";
	 // Quando houver uma mudança de rota => modificar estado
	 $scope.$on('mudancaDeRota', function(event, state, params){
		 $state.go(state, params);
	 });
	 // Quando houver alteração do grupo empresa na barra administrativa                                           
	 $scope.$on('alterouGrupoEmpresa', function(event){
		 if($scope.exibeTela){// Avalia grupo empresa
			 if($scope.usuariologado.grupoempresa){// Reseta seleção de filtro específico de empresa
				 $scope.busca = null;
				 buscaVendas(true);
				 buscaFiliais(true);
				 //buscaAdquirentes(true);
			 }else{ // reseta tudo e não faz buscas 
				 $scope.vendas = []; 
				 $scope.filiais = [];
				 $scope.adquirentes = [];
				 $scope.venda.faixa_registros = '0-0';
				 $scope.venda.pagina = 1;
				 $scope.venda.total_paginas = 0;
			 }
		 }
	 });
	 // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
	 $scope.$on('acessoDeTelaNotificado', function(event){
		 $scope.exibeTela = true;
		 // Avalia grupo empresa
		 if($scope.usuariologado.grupoempresa){// Reseta seleção de filtro específico de empresa
			 $scope.busca = null;
			 buscaVendas(true);
			 buscaFiliais(true);
			 //buscaAdquirentes(true);
		 }else{ // reseta tudo e não faz buscas 
			 $scope.vendas = []; 
			 $scope.filiais = [];
			 $scope.adquirentes = [];
			 $scope.venda.faixa_registros = '0-0';
			 $scope.venda.pagina = 1;
			 $scope.venda.total_paginas = 0;
		 }
	 });
	 
	 //Acessou a tela
	 $scope.$emit("acessouTela");
	 //Busca vendas
	 //$scope.buscaVendas();
 };

 // PAGINAÇÃO
	/**
		* Altera efetivamente a página exibida
		*/                                            
	var setPagina = function(pagina){
		if(pagina >= 1 && pagina <= $scope.venda.total_paginas){ 
			$scope.venda.pagina = pagina;
			buscaVendas(); 
		}
		$scope.atualizaPaginaDigitada();    
	};
	/**
		* Vai para a página anterior
		*/
	$scope.retrocedePagina = function(){
		setPagina($scope.venda.pagina - 1); 
	};
	/**
		* Vai para a página seguinte
		*/                                            
	$scope.avancaPagina = function () {
		setPagina($scope.venda.pagina + 1);
	};
	/**
		* Foi informada pelo usuário uma página para ser exibida
		*/                                            
	$scope.alteraPagina = function(){
		if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
		else $scope.atualizaPaginaDigitada();  
	};
	/**
		* Sincroniza a página digitada com a que efetivamente está sendo exibida
		*/                                            
	$scope.atualizaPaginaDigitada = function(){
		$scope.paginaInformada = $scope.venda.pagina; 
	};                                             
	/**
		* Notifica que o total de itens por página foi alterado
		*/                                            
	$scope.alterouItensPagina = function(){
		if($scope.vendas.length > 0) buscaVendas();   
	};
																						 
 //BUSCA
																						 
  $scope.resetaBusca = function(){
		$scope.busca = '';
		$scope.filtraVendas();
	};
	$scope.filtraVendas = function(){
		$scope.venda.busca = $scope.busca;
		buscaVendas();
	};
  $scope.alterouFilial = function(){
		$scope.venda.busca = $scope.busca;
		buscaVendas();
		$scope.filtro = null;
	};
																						 
	var buscaVendas = function(showMessage){
		
		if(!$scope.usuariologado.grupoempresa){
			$scope.vendas = [];
			$scope.venda.total_registros = 0;
			$scope.venda.total_paginas = 0;
			$scope.venda.faixa_registros = '0-0';
			$scope.paginaInformada = 1;
			if (showMessage) $scope.showAlert('É necessário selecionar um grupo empresa!', true, 'warning', true);
		}else{
			
			$scope.showProgress(divPortletBodyFilialPos);
			
			var filtros = [{
				id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.id_grupo*/ 516,
				valor: $scope.usuariologado.grupoempresa.id_grupo
			}];
			
			// Verifica se tem algum valor para ser filtrado    
			if ($scope.venda.busca.length > 0) filtros.push({
				id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.ds_fantasia*/ 204,
				valor: $scope.venda.busca + '%'
			});
			
			//if ($scope.usuariologado.tbcontacorrentetbloginadquirenteempresa) filtros.push({
			// id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.nu_cnpj*/ 500,
			// valor: $scope.usuariologado.tbcontacorrentetbloginadquirenteempresa.nu_cnpj
			// });
			
			$webapi.get($apis.getUrl($apis.card.tbcontacorrentetbloginadquirenteempresa,
															 [$scope.token, 5, /*$campos.card.tbcontacorrentetbloginadquirenteempresa.id_grupo*/ 100, 0,
																$scope.venda.itens_pagina, $scope.venda.pagina],
															 filtros)) 
				.then(function(dados){
				$scope.vendas = dados.Registros;
				$scope.venda.total_registros = dados.TotalDeRegistros;
				$scope.venda.total_paginas = Math.ceil($scope.venda.total_registros / $scope.venda.itens_pagina);
				if($scope.vendas.length === 0) $scope.venda.faixa_registros = '0-0';
				else{
					var registroInicial = ($scope.venda.pagina - 1)*$scope.venda.itens_pagina + 1;
					var registroFinal = registroInicial - 1 + $scope.venda.itens_pagina;
					if(registroFinal > $scope.venda.total_registros) registroFinal = $scope.venda.total_registros;
					$scope.venda.faixa_registros =  registroInicial + '-' + registroFinal;
				}
				// Verifica se a página atual é maior que o total de páginas
				if($scope.venda.pagina > $scope.venda.total_paginas)
					setPagina(1); // volta para a primeira página e refaz a busca
				
				// Esconde o progress
				$scope.hideProgress(divPortletBodyFilialPos);
			},
							function(failData){
				if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
				else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
				else $scope.showAlert('Houve uma falha ao requisitar parâmetros (' + failData.status + ')', true, 'danger', true);
				// Esconde o progress
				$scope.hideProgress(divPortletBodyFilialPos);
			}); 
		}
	};
																						 
	var buscaFiliais = function(showMessage){
		
		//$scope.showProgress(divPortletBodyFiltrosPos, 10000);    
		$scope.showProgress(divPortletBodyFilialPos); 
		var filtros = [];
		
		// Somente com status ativo
		//filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 516, valor: $scope.usuariologado.grupoempresa.id_grupo});
		
		// Filtro do grupo empresa => barra administrativa
		if($scope.usuariologado.grupoempresa){ 
			filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 516, valor: $scope.usuariologado.grupoempresa.id_grupo});
			if ($scope.usuariologado.tbcontacorrentetbloginadquirenteempresa) filtros.push({
				id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.nu_cnpj*/ 500,
				valor: $scope.usuariologado.tbcontacorrentetbloginadquirenteempresa.nu_cnpj
			});
			
			$webapi.get($apis.getUrl($apis.card.tbcontacorrentetbloginadquirenteempresa, 
															 [$scope.token, 2, /*$campos.cliente.empresa.ds_fantasia*/ 100],
															 filtros)) 
				.then(function(dados){
				$scope.filiais = dados.Registros;
			},
							function(failData){
				if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
				else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
				else $scope.showAlert('Houve uma falha ao obter vigencias (' + failData.status + ')', true, 'danger', true);
				$scope.hideProgress(divPortletBodyFiltrosPos);
			});     
		};																						 
	};
																						 
	var buscaAdquirentes = function(showMessage){
		
		//$scope.showProgress(divPortletBodyFiltrosPos, 10000);    
		$scope.showProgress(divPortletBodyFilialPos); 
		var filtros = [];
		
		// Somente com status ativo
		//filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 516, valor: $scope.usuariologado.grupoempresa.id_grupo});
		
		// Filtro do grupo empresa => barra administrativa
		if($scope.usuariologado.grupoempresa){ 
			filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 516, valor: $scope.usuariologado.grupoempresa.id_grupo});
			if ($scope.usuariologado.tbcontacorrentetbloginadquirenteempresa) filtros.push({
				id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.nu_cnpj*/ 500,
				valor: $scope.usuariologado.tbcontacorrentetbloginadquirenteempresa.nu_cnpj
			});
			
			$webapi.get($apis.getUrl($apis.card.tbcontacorrentetbloginadquirenteempresa, 
															 [$scope.token, 2, /*$campos.cliente.empresa.ds_fantasia*/ 100],
															 filtros)) 
				.then(function(dados){
				$scope.adquirentes = dados.Registros;
			},
							function(failData){
				if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
				else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
				else $scope.showAlert('Houve uma falha ao obter vigencias (' + failData.status + ')', true, 'danger', true);
				$scope.hideProgress(divPortletBodyFiltrosPos);
			});     
		};																						 
	};
																						 
 // Data MIN
	$scope.exibeCalendarioDataMin = function($event) {
		if($event){
			$event.preventDefault();
			$event.stopPropagation();
		}
		$scope.abrirCalendarioDataMin = !$scope.abrirCalendarioDataMin;
		$scope.abrirCalendarioDataMax = false;
	};
  $scope.alterouDataMin = function(){
		ajustaIntervaloDeData(); 
	};
 // Data MAX
  $scope.exibeCalendarioDataMax = function($event) {
		if($event){
			$event.preventDefault();
			$event.stopPropagation();
		}
		$scope.abrirCalendarioDataMax = !$scope.abrirCalendarioDataMax;
		$scope.abrirCalendarioDataMin = false;
	};
	$scope.alterouDataMax = function(){
		if($scope.filtro.datamax === null) $scope.filtro.datamax = '';
		else ajustaIntervaloDeData(); 
	};
																						 
 //CALCULO DE TOTAL GERAL
 $scope.totalGeral = function(var total){
	 $scope.totalVendas = $scope.totalVendas + total;
 }
}]);