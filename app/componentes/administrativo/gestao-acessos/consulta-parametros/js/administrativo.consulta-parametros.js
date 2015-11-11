/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module("administrativo-consulta-parametros", []) 

.controller("administrativo-consulta-parametrosCtrl", ['$scope',
                                           '$state',
                                           '$filter',
                                           /*'$campos',*/
                                           '$webapi',
                                           '$apis', 
                                           function($scope,$state,$filter,/*$campos,*/$webapi,$apis){ 

    var divPortletBodyFilialPos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo usuário
    $scope.parametros = [];
    $scope.itens_pagina = [50, 100, 150, 200];
    $scope.busca = ''; // model do input de busca                                            
    $scope.parametro = {busca:'', itens_pagina : $scope.itens_pagina[0], pagina : 1,
                     total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                     };   
    $scope.parametroSelecionada = undefined;
    // Flags
    $scope.exibeTela = false;                                           
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
                                               
    // Inicialização do controller
    $scope.administrativo_parametrosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Consulta Parâmetros';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            // Refaz a busca
            if($scope.exibeTela) $scope.buscaParametros(true);
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Busca parametros
            $scope.buscaParametros();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Busca parametros
        //$scope.buscaParametros();
    };
                                               
                                               
    // PERMISSÕES
    /**
      * Retorna true se o usuário pode consultar as parametros
      */
    $scope.usuarioPodeConsultarParametros = function(){
        return typeof $scope.usuariologado.grupoempresa !== 'undefined';    
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
    $scope.avancaPagina = function(){
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
        $scope.filtraParametros();
    };
    $scope.filtraParametros = function(){
        $scope.parametro.busca = $scope.busca;
        $scope.buscaParametros();
    };
    $scope.buscaParametros = function(showMessage){
   
       if(!$scope.usuariologado.grupoempresa){
           $scope.parametros = [];
           $scope.parametro.total_registros = 0;
           $scope.parametro.total_paginas = 0;
           $scope.parametro.faixa_registros = '0-0';
           $scope.paginaInformada = 1;
           if(showMessage) $scope.showAlert('É necessário selecionar um grupo empresa!', true, 'warning', true);             
       }else{

           $scope.showProgress(divPortletBodyFilialPos);    

           var filtros = [{id: /*$campos.cliente.empresa.id_grupo*/ 116, 
                           valor: $scope.usuariologado.grupoempresa.id_grupo}];

           // Verifica se tem algum valor para ser filtrado    
           if($scope.parametro.busca.length > 0) filtros.push({id: /*$campos.cliente.empresa.ds_fantasia*/ 104, 
                                                          valor: $scope.parametro.busca + '%'});        

           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
			
           if ($scope.usuariologado.tbContaCorrente) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100,
                                                        valor: $scope.usuariologado.tbContaCorrente.cdContaCorrente
           });

           $webapi.get($apis.getUrl($apis.cliente.empresa,
                                    [$scope.token, 2, /*$campos.cliente.empresa.ds_fantasia*/ 104, 0, 
                                     $scope.parametro.itens_pagina, $scope.parametro.pagina],
                                    filtros)) 
                .then(function(dados){
                    $scope.parametros = dados.Registros;
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
}]);
















































/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 06/11/2015
 *
 

// App
angular.module("administrativo-consulta-parametros", []) 

.controller("administrativo-consulta-parametrosCtrl", ['$scope',   
                                            '$state',
                                            '$http',
                                            /*'$campos',
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            function($scope,$state,$http,/*$campos,
                                                     $webapi,$apis,$filter){ 
   
    var divPortletBodyFiltroPos = 0; // posição da div que vai receber o loading progress                             
    var divPortletBodyParametrosPos = 1; // posição da div que vai receber o loading progress   
    // flags
    $scope.exibeTela = false;
    $scope.paginaInformada = 1;
    $scope.parametros = [];
		$scope.itens_pagina = [50, 100, 150, 200];
		$scope.busca = ''; // model do input de busca  																					
    $scope.parametro = {busca:'', itens_pagina : $scope.itens_pagina[0], pagina : 1,
                     total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                     };
    $scope.parametroSelecionado = undefined;
    // Flags
    $scope.exibeTela = false;
																							
		$scope.administrativo_parametrosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Consulta Parâmetros';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            // Refaz a busca
            if($scope.exibeTela) $scope.buscaFiliais(true);
        }); 
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){// && $scope.methodsDoControllerCorrente.length > 0){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'ATUALIZAÇÃO' }).length > 0;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'CADASTRO' }).length > 0;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;//$filter('filter')($scope.methodsDoControllerCorrente, function(m){ return m.ds_method.toUpperCase() === 'REMOÇÃO' }).length > 0;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Busca filiais
            $scope.buscaFiliais();
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
        // Busca filiais
        //$scope.buscaFiliais();
    };
		
	
    //$scope.filtro = {
		//	cnpj: null, fantasia: null, adquirente: null, estabelecimento: null, 
		//	estabelecimentoConsulta: null, contaCorrente:null
		//}
																							
																							
    // Inicialização do controller
    /*$scope.administrativo_consultaParametrosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Consulta Parâmetros';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
			// Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            // Refaz a busca
            if($scope.exibeTela) $scope.buscaFiliais(true);
        }); 
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            if($scope.exibeTela){
							if($scope.usuariologado.grupoempresa){
								// Reseta seleção de filtro específico de empresa
								$scope.filtro.cnpj = $scope.filtro.fantasia = $scope.filtro.adquirente = $scope.filtro.estabelecimento = 
									$scope.filtro.estabelecimentoConsulta = $scope.filtro.contaCorrente = null;
								funcaoBusca(true);
							}else{
								$scope.cnpj = [];
								$scope.fantasia = [];
								$scope.adquirente = [];
								$scope.estabelecimento = [];
								$scope.estabelecimentoConsulta = [];
								$scope.contaCorrente = [];
							}
						}
            // Busca
            // ...
						// Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
					$scope.$on('acessoDeTelaNotificado', function(event){
							$scope.exibeTela = true;
							// Busca filiais
							$scope.buscaFiliais();
					});
					// Acessou a tela
					$scope.$emit("acessouTela");
					// Busca filiais
					//$scope.buscaFiliais();
						
        }; 
        // Acessou a tela
        //$scope.$emit("acessouTela");
        //$scope.exibeTela = true;
        // Busca 
        // ...
																							
																							
    }]); 
                                                
                                                
    // ....
*/
