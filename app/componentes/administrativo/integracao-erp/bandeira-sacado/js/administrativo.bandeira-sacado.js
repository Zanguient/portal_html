/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *
 *  Versão 1.0 - 06/05/2016
 *
 */

// App
angular.module("administrativo-bandeira-sacado", []).controller("administrativo-bandeiraSacadoCtrl", ['$scope',
                                             '$state',
                                             '$filter',
                                             '$timeout',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             function($scope,$state,$filter,$timeout,
                                                      /*$campos,*/$webapi,$apis){ 
    
    // Exibição
    $scope.itens_pagina = [50, 100, 150, 200]; 
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Filtros
    $scope.adquirentes = [];
    $scope.bandeiras = [];
	$scope.sacado = "";
	$scope.statusLogado = false;
    $scope.filtro = {adquirente : null, bandeira : null, sacado : null,
                     itens_pagina : $scope.itens_pagina[0], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0};
    var divPortletBodyFiltroPos = 0; // posição da div que vai receber o loading progress
    // Cadastro
    $scope.cadastro = {adquirente : null, login : '', estabelecimento : '', senha : '', 
                       centralizadora : null, estabelecimentoConsulta : ''};                                       
    // Alteração
    $scope.alterando = true;                                             
    $scope.alteracao = {id : 0, login : '', estabelecimento : '', senha : '',
                        centralizadora : null, estabelecimentoConsulta : ''};                                             
    // flag
    $scope.exibePrimeiraLinha = false; 
    $scope.exibeTela = false;                                             
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    //var permissaoRemocao = false;              
                                                 
    
   // Inicialização do controller
    $scope.administrativo_bandeiraSacadoInit = function(){
			// Título da página 
			$scope.pagina.titulo = 'Administrativo';                          
			$scope.pagina.subtitulo = 'Bandeira Sacado';
			// Quando houver uma mudança de rota => modificar estado
			$scope.$on('mudancaDeRota', function(event, state, params){
				$state.go(state, params);
			});
			// Quando houver alteração do grupo empresa na barra administrativa                                           
			$scope.$on('alterouGrupoEmpresa', function(event){ 
				if($scope.exibeTela){
					// Avalia grupo empresa
					if($scope.usuariologado.grupoempresa){ 
						// Reseta seleção de filtro específico de empresa
						buscaAdquirentes();
						buscaBandeira();
						$scope.sacado = null;
						$scope.statusLogado = true;
					}else{ // reseta tudo e não faz buscas
						$scope.statusLogado = false;
						$scope.adquirentes = [];
						$scope.bandeiras = [];
						$scope.sacado = null;
						$scope.filtro.adquirente = '';
						$scope.filtro.bandeira = '';
						$scope.filtro.sacado = '';
						$scope.filtro.faixa_registros = '0-0';
						$scope.filtro.pagina = 1;
						$scope.filtro.total_paginas = 0;
					}
				}
			}); 
			// Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
			$scope.$on('acessoDeTelaNotificado', function(event){
				$scope.exibeTela = true;
				// Avalia grupo empresa
				if($scope.usuariologado.grupoempresa){ 
					// Reseta seleção de filtro específico de empresa
					buscaAdquirentes();
					buscaBandeira();
					$scope.sacado = null;
					$scope.statusLogado = true;
				}else{ // reseta tudo e não faz buscas
					$scope.statusLogado = false;
					$scope.adquirentes = [];
					$scope.bandeiras = [];
					$scope.sacado = null;
					$scope.filtro.adquirente = '';
					$scope.filtro.bandeira = '';
					$scope.filtro.sacado = '';
					$scope.filtro.faixa_registros = '0-0';
					$scope.filtro.pagina = 1;
					$scope.filtro.total_paginas = 0;
				}
			});
			// Acessou a tela
			$scope.$emit("acessouTela");
		};
																							 
		$scope.cancelar = function(){
			$scope.exibePrimeiraLinha = false;    
		};
		
		var buscaAdquirentes = function(showMessage){
			
			if($scope.usuariologado.grupoempresa){
				
				$scope.showProgress(divPortletBodyFiltroPos); 
				var filtros = [{id : /*$campos.card.tbadquirente.stAdquirente*/ 103, valor : 1}];
					
				$webapi.get($apis.getUrl($apis.card.tbadquirente, [$scope.token, 1, /*$campos.cliente.empresa.ds_fantasia*/ 101], filtros)) 
					.then(function(dados){
					//console.log(dados.Registros);
					$scope.adquirentes = dados.Registros;
					$scope.hideProgress(divPortletBodyFiltroPos);
				},
				function(failData){
					if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
					else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
					else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
					$scope.hideProgress(divPortletBodyFiltrosPos);
				});
			}
		};
		
		var buscaBandeira = function(showMessage){
			
			if($scope.usuariologado.grupoempresa){
				
				$scope.showProgress(divPortletBodyFiltroPos); 
				var filtros = [];
				if($scope.filtro.adquirente && $scope.filtro.adquirente !== null){
					filtros.push({id:/*$campos.card.tbbandeira.cdAdquirente*/ 102,
					valor: $scope.filtro.adquirente.cdAdquirente});
				}
					
				$webapi.get($apis.getUrl($apis.card.tbbandeira, [$scope.token, 1, /*$campos.card.tbbandeira.dsBandeira*/ 101], filtros)) 
					.then(function(dados){
					//console.log(dados.Registros);
					$scope.bandeiras = dados.Registros;
					$scope.hideProgress(divPortletBodyFiltroPos);
				},
				function(failData){
					if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
					else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
					else $scope.showAlert('Houve uma falha ao obter bandeiras (' + failData.status + ')', true, 'danger', true);
					$scope.hideProgress(divPortletBodyFiltrosPos);
				});
			}
		};
		
		$scope.alterouAdquirente = function(){
			$scope.filtro.bandeira = null;
			buscaBandeira();
		};
		
		$scope.limpaFiltros = function(){
			$scope.filtro.adquirente = null;
			$scope.filtro.bandeira = null;
			$scope.filtro.sacado = null;
			buscaAdquirentes();
			buscaBandeira();
		};
		
	}]);