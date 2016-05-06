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
angular.module("administrativo-bandeira-sacado", []) 

.controller("administrativo-bandeiraSacadoCtrl", ['$scope',
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
    $scope.bandeira = [];
		$scope.sacado = "";
    $scope.filtro = {filial : null, adquirente : null, status : null,
                     itens_pagina : $scope.itens_pagina[0], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyDadosPos = 1; // posição da div que vai receber o loading progress
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
						
					}else{ // reseta tudo e não faz buscas 
						$scope.adquirentes = [];
						$scope.bandeiras = [];
						$scope.sacado = "";
						// Dados de acesso
						$scope.filtro.faixa_registros = '0-0';
						$scope.filtro.pagina = 1;
						$scope.filtro.total_paginas = 0;
					}
				}
			});
			// Obtém as permissões
			if($scope.methodsDoControllerCorrente){
				permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
				permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
				//permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
			}
			// Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
			$scope.$on('acessoDeTelaNotificado', function(event){
				$scope.exibeTela = true;
				// Carrega filiais
				if($scope.usuariologado.grupoempresa) {
					buscaAdquirentes(true);
				}
			});
			// Acessou a tela
			$scope.$emit("acessouTela");
			// Carrega filiais
			//if($scope.usuariologado.grupoempresa) buscaFiliais();
		};
																							 
		var buscaAdquirentes = function(showMessage){
			
			if($scope.usuariologado.grupoempresa){
				
				//$scope.showProgress(divPortletBodyFiltrosPos, 10000);    
				//$scope.showProgress(divPortletBodyFiltrosPos); 
				var filtros = [{id : /*$campos.card.tbadquirente.stAdquirente*/ 103,
												valor : 1}];
								
				$webapi.get($apis.getUrl($apis.card.tbadquirente, 
																 [$scope.token, 1, /*$campos.cliente.empresa.ds_fantasia*/ 101],
																 filtros)) 
					.then(function(dados){
					//console.log(dados.Registros);
					$scope.adquirentes = dados.Registros;
				},
								function(failData){
					if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
					else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
					else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
					//$scope.hideProgress(divPortletBodyFiltrosPos);
				});
			}
		};
																							 
		$scope.cancelar = function(){
			$scope.exibePrimeiraLinha = false;    
		};
	}]);