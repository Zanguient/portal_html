/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0.1 - 02/12/2015
 *  - Filtro por status dos dados de acesso
 *
 *  Versão 1.0 - 17/11/2015
 *
 */

// App
angular.module("administrativo-consulta-parametros", []) 

.controller("administrativo-consulta-parametrosCtrl", ['$scope',   
                                            '$state',
                                            '$http',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            function($scope,$state,$http,/*$campos,*/
                                                     $webapi,$apis,$filter){ 
                                        
                                                
    var divPortletBodyFilialPos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo usuário
    $scope.parametros = [];
		$scope.filiais = [];
		$scope.vigencias = [];
		$scope.adquirentes = [];
    $scope.statusBusca = true;
		$scope.statusAdquirente = false;
    $scope.itens_pagina = [50, 100, 150, 200];
    $scope.busca = ''; // model do input de busca
		$scope.buscaAdquirente = '';
		$scope.buscaStatus = '';
    $scope.parametro = {busca:'', buscaAdquirente:'', buscaStatus:'', itens_pagina : $scope.itens_pagina[0], pagina : 1,
												total_registros : 0, faixa_registros : '0-0', total_paginas : 0
											 };   
    $scope.parametroSelecionada = undefined;
    // Flags
    $scope.exibeTela = false;                                           
                                               
    // Inicialização do controller
    $scope.administrativo_consultaParametrosInit = function(){
			// Título da página 
			$scope.pagina.titulo = 'Gestão de Acessos';                          
			$scope.pagina.subtitulo = 'Consulta Parâmetros';
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
						$scope.busca = null;
						buscaFiliais(true);
						$scope.buscaParametros(true);
						buscaAdquirentes();
						$scope.busca = '';
					}else{ // reseta tudo e não faz buscas 
						$scope.filiais = []; 
						$scope.parametros = [];
						$scope.buscaAdquirente = '';
						$scope.buscaStatus = '';
						$scope.parametro.buscaAdquirente = '';
						$scope.parametro.buscaStatus = '';
						$scope.parametro.busca = '';
						$scope.grupo = [];
						$scope.parametro.faixa_registros = '0-0';
						$scope.parametro.pagina = 1;
						$scope.parametro.total_paginas = 0;
					}
				}
			}); 
			// Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
			$scope.$on('acessoDeTelaNotificado', function(event){
				$scope.exibeTela = true;
				// Avalia grupo empresa
				if($scope.usuariologado.grupoempresa){ 
					// Reseta seleção de filtro específico de empresa
					$scope.busca = null;
					buscaFiliais(true);
					$scope.buscaParametros(true);
					buscaAdquirentes();
					$scope.busca = '';
				}else{ // reseta tudo e não faz buscas 
					$scope.filiais = []; 
					$scope.parametros = [];
					$scope.grupo = [];
					$scope.buscaAdquirente = '';
					$scope.buscaStatus = '';
					$scope.parametro.buscaAdquirente = '';
					$scope.parametro.buscaStatus = '';
					$scope.parametro.busca = '';
					$scope.parametro.faixa_registros = '0-0';
					$scope.parametro.pagina = 1;
					$scope.parametro.total_paginas = 0;
				}
			});
			// Acessou a tela
			$scope.$emit("acessouTela");
			// Busca parametros
			//$scope.buscaParametros();
		};
                                               
                                            
    
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
			if(pagina >= 1 && pagina <= $scope.parametro.total_paginas){ 
				$scope.parametro.pagina = pagina;
				$scope.buscaParametros(); 
			}
			$scope.atualizaPaginaDigitada();    
		};
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
			setPagina($scope.parametro.pagina - 1); 
		};
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function () {
			setPagina($scope.parametro.pagina + 1);
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
			$scope.paginaInformada = $scope.parametro.pagina; 
		};                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
			if($scope.parametros.length > 0) $scope.buscaParametros();   
		};
                                               
                                               
                                               
    // BUSCA
																							
    $scope.resetaBusca = function(){
			$scope.busca = '';
			$scope.buscaAdquirente = '';
			$scope.buscaStatus = '';
			$scope.statusBusca = false;
			$scope.statusAdquirente = false;
      $scope.filtraParametros();
    };
    $scope.filtraParametros = function(){
			$scope.parametro.busca = $scope.busca;
			$scope.parametro.buscaAdquirente = $scope.buscaAdquirente;
			$scope.parametro.buscaStatus = $scope.buscaStatus;
			$scope.buscaParametros();
    };
    $scope.alterouFilial = function(){
			$scope.buscaAdquirente = '';
			$scope.parametro.buscaAdquirente = '';
			$scope.buscaStatus = '';
			$scope.parametro.buscaStatus = '';
			$scope.parametro.busca = $scope.busca;
			$scope.buscaParametros();
			buscaAdquirentes();
			$scope.statusBusca = true;
			$scope.statusAdquirente = true;
			$scope.filtro = null;
		};
																							
    $scope.buscaParametros = function(showMessage){
			
			if(!$scope.usuariologado.grupoempresa){
				$scope.parametros = [];
				$scope.parametro.total_registros = 0;
				$scope.parametro.total_paginas = 0;
				$scope.parametro.faixa_registros = '0-0';
				$scope.paginaInformada = 1;
				if (showMessage) $scope.showAlert('É necessário selecionar um grupo empresa!', true, 'warning', true);
			}else{
				
				$scope.showProgress(divPortletBodyFilialPos);
				
				var filtros = [{
					id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.id_grupo*/ 516,
					valor: $scope.usuariologado.grupoempresa.id_grupo
				}];
				
				//FILTROS
				
				//Filial
				if($scope.parametro.busca !== '' && $scope.parametro.busca !== null){
					filtros.push({
						id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.ds_fantasia*/ 500, 
						valor: $scope.parametro.busca.nu_cnpj
					});
				}
				
				//Adquirente
				if($scope.parametro.buscaAdquirente !== '' && $scope.parametro.buscaAdquirente !== null){
					filtros.push({
						id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.ds_fantasia*/ 300,
						valor: $scope.parametro.buscaAdquirente.cdAdquirente
					});
				}			
				
				//Status
				if($scope.parametro.buscaStatus !== '' && $scope.parametro.buscaStatus !== null){
					if($scope.parametro.buscaStatus == "1"){
						filtros.push({
							id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.stLoginAdquirente*/ 608,
							valor: 1,
						});
					}else if ($scope.parametro.buscaStatus == "0"){
						filtros.push({
							id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.stLoginAdquirente*/ 608,
							valor: 0,
						});        
					}
				}
				
				$webapi.get($apis.getUrl($apis.card.tbcontacorrentetbloginadquirenteempresa,
																 [$scope.token, 5, /*$campos.card.tbcontacorrentetbloginadquirenteempresa.id_grupo*/ 100, 0,
																	$scope.parametro.itens_pagina, $scope.parametro.pagina],
																 filtros)) 
					.then(function(dados){
					$scope.parametros = dados.Registros;
					//if ($scope.parametros.status == 1) $scope.parametros.status = "Não";
					//else ($scope.parametros.status == 0) $scope.parametros.status = "Sim";
					$scope.parametro.total_registros = dados.TotalDeRegistros;
					$scope.parametro.total_paginas = Math.ceil($scope.parametro.total_registros / $scope.parametro.itens_pagina);
					if($scope.parametros.length === 0) $scope.parametro.faixa_registros = '0-0';
					else{
						var registroInicial = ($scope.parametro.pagina - 1)*$scope.parametro.itens_pagina + 1;
						var registroFinal = registroInicial - 1 + $scope.parametro.itens_pagina;
						if(registroFinal > $scope.parametro.total_registros) registroFinal = $scope.parametro.total_registros;
						$scope.parametro.faixa_registros =  registroInicial + '-' + registroFinal;
					}
					// Verifica se a página atual é maior que o total de páginas
					if($scope.parametro.pagina > $scope.parametro.total_paginas)
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

			if($scope.usuariologado.grupoempresa){

				//$scope.showProgress(divPortletBodyFiltrosPos, 10000);    
				$scope.showProgress(divPortletBodyFilialPos); 
				var filtros = [];
				
				filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 114, valor: 1});

       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuariologado.grupoempresa.id_grupo});
           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       }

				// Somente com status ativo
				//filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 516, valor: $scope.usuariologado.grupoempresa.id_grupo});

				// Filtro do grupo empresa => barra administrativa
				//if($scope.usuariologado.grupoempresa){ 
					//filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 516, valor: $scope.usuariologado.grupoempresa.id_grupo});
					//if ($scope.usuariologado.tbcontacorrentetbloginadquirenteempresa) filtros.push({
//						id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.nu_cnpj*/ 500,
	//					valor: $scope.usuariologado.tbcontacorrentetbloginadquirenteempresa.nu_cnpj
		//			});

					$webapi.get($apis.getUrl($apis.cliente.empresa, 
																	 [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
																	 filtros)) 
						.then(function(dados){
						$scope.filiais = dados.Registros;
					},
									function(failData){
						if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
						else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
						else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
						$scope.hideProgress(divPortletBodyFiltrosPos);
					});     
				}
			};
																							
 		var buscaAdquirentes = function(showMessage){
			
			if($scope.usuariologado.grupoempresa){
				
				//$scope.showProgress(divPortletBodyFiltrosPos, 10000);    
				$scope.showProgress(divPortletBodyFilialPos); 
				var filtros = [{id : /*$campos.card.tbadquirente.stAdquirente*/ 103,
                       valor : 1}];
				
				if($scope.parametro.busca && $scope.parametro.busca !== null){
					// Filtro do grupo empresa => barra administrativa
					filtros.push({id: /*$campos.card.tbadquirente.cnpj*/ 305,
												valor: $scope.parametro.busca.nu_cnpj});
				}
				//console.log(filtros);
				// Somente com status ativo
				//filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 516, valor: $scope.usuariologado.grupoempresa.id_grupo});
				
				// Filtro do grupo empresa => barra administrativa
				//if($scope.usuariologado.grupoempresa){ 
					//filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 516, valor: $scope.usuariologado.grupoempresa.id_grupo});
					
					// Verifica se tem algum valor para ser filtrado    
				//if ($scope.parametro.busca.length > 0) filtros.push({
					//id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.ds_fantasia*/ 204,
					//valor: $scope.parametro.busca + '%'
				//});
					
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
						$scope.hideProgress(divPortletBodyFiltrosPos);
					});     
				//}
			}
		};
	}]);